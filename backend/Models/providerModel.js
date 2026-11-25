const pool = require("../db")



// find the plan prices
const providerSubscriptionCost = async({plans})=>{
    console.log(plans)

    try{
        let baseAmount = 0;
        const gstRate = 18;
        let services = []

        for(let i=0;i<plans.length;i++){

            const plan = plans[i]
            const plansDb = await pool.query("SELECT service_id,monthly_price from service_platform_plans WHERE service_name=$1",[plan])
            const serviceId = plansDb.rows[0].service_id
            const service = {
                plan,
                serviceId
            }

            services.push(service)
            const monthlyPrice = Number(plansDb.rows[0].monthly_price)
            baseAmount += monthlyPrice
        }

        console.log(baseAmount)

        // GST AMOUNT
        const gstAmount = baseAmount * (gstRate/100)

        // calculate the total price
        const totalPrice = baseAmount + gstAmount
        console.log(totalPrice)

        return {
            services,
            gstRate,
            gstAmount,
            baseAmount,
            totalPrice
        }

    }
    catch(error){
        console.log(error)
        return error
    }
}

// create provider subscription
const createProviderSubscription = async ({
    services,
    gstRate,
    gstAmount,
    baseAmount,
    totalPrice,
    userId
}) => {
    let client;

    try {
        // 1. Validate payload
        if (
            !Array.isArray(services) ||
            services.length === 0 ||
            gstRate == null ||
            gstAmount == null ||
            baseAmount == null ||
            totalPrice == null ||
            !userId
        ) {
            return {
                status: 400,
                message: "Please provide all required fields"
            };
        }

        // 2. Validate numeric values
        const amounts = [gstRate, gstAmount, baseAmount, totalPrice];

        if (
            !amounts.every(
                value => Number.isFinite(Number(value)) && Number(value) >= 0
            )
        ) {
            return {
                status: 400,
                message: "Invalid price values"
            };
        }

        // 3. Get dedicated database connection
        client = await pool.connect();

        // 4. Start transaction
        await client.query("BEGIN");

        // 5. Check whether provider already has a subscription
        const checkUserExist = await client.query(
            `SELECT subscription_id
             FROM provider_subscription
             WHERE user_id = $1
             FOR UPDATE`,
            [userId]
        );

        if (checkUserExist.rowCount > 0) {
            await client.query("ROLLBACK");

            return {
                status: 409,
                message: "User subscription already exists"
            };
        }

        // 6. Create subscription
        const createSubscription = await client.query(
            `INSERT INTO provider_subscription
            (
                selected_services,
                base_amount,
                gst_rate,
                gst_amount,
                total_amount,
                subscription_status,
                user_id
            )
            VALUES
            ($1::jsonb, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [
                JSON.stringify(services),
                baseAmount,
                gstRate,
                gstAmount,
                totalPrice,
                "active",
                userId
            ]
        );

        const subscriptionData = createSubscription.rows[0];

        if (!subscriptionData) {
            throw new Error("Subscription creation returned no data");
        }

        const {
            subscription_id,
            started_at,
            expires_at
        } = subscriptionData;

        // 7. Create subscription history entry
        await client.query(
            `INSERT INTO subscription_history
            (
                subscription_id,
                user_id,
                selected_services,
                base_amount,
                gst_rate,
                gst_amount,
                total_amount,
                started_at,
                expires_at,
                transaction_type,
                payment_status
            )
            VALUES
            ($1, $2, $3::jsonb, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [
                subscription_id,
                userId,
                JSON.stringify(services),
                baseAmount,
                gstRate,
                gstAmount,
                totalPrice,
                started_at,
                expires_at,
                "creation",
                "paid"
            ]
        );

        // 8. Commit transaction
        await client.query("COMMIT");

        return {
            status: 201,
            message: "Subscription created successfully",
            data: subscriptionData
        };
    } catch (error) {
        if (client) {
            await client.query("ROLLBACK").catch(() => {});
        }

        console.error("Subscription creation failed:", error);

        return {
            status: 500,
            message: "Internal server error"
        };
    } finally {
        if (client) {
            client.release();
        }
    }
};

// get provider subscription details
const getProviderSubscriptionDetails = async({userId})=>{
    try{
        // check if the userId is not null or 
        console.log(userId,"user id in get provider subscription details")
        if(!userId){
            return {
                status:400,
                message:"User ID is required"
            }
        }

        // get the provider subsciption details from DB
        const subscriptionDb = await pool.query("SELECT * FROM provider_subscription WHERE user_id=$1",[userId])
        console.log(subscriptionDb.rows,"provider subscription details")
        console.log(subscriptionDb.rowCount,"provider subscription details count")
        if(subscriptionDb.rowCount === 0){
            return {
                status:400,
                message:"No subscription found! Please create subscription"
            }
        }

        return {
            status:200,
            message:"Subscription details fetched successfully",
            data:subscriptionDb.rows[0]
        }

    }
    catch(error){
        console.log(error)
        return error
    }
}

// subscription renewal 
const renewProviderSubscription = async ({
    services,
    gstRate,
    gstAmount,
    baseAmount,
    totalPrice,
    userId
}) => {
    let client;

    try {
        // 1. Validate payload
        if (
            !Array.isArray(services) ||
            services.length === 0 ||
            gstRate == null ||
            gstAmount == null ||
            baseAmount == null ||
            totalPrice == null ||
            !userId
        ) {
            return {
                status: 400,
                message: "Renewal failed due to invalid payload"
            };
        }

        // Validate numeric values
        const amounts = [gstRate, gstAmount, baseAmount, totalPrice];

        if (!amounts.every(value => Number.isFinite(Number(value)) && Number(value) >= 0)) {
            return {
                status: 400,
                message: "Invalid price values"
            };
        }

        // 2. Get a dedicated database connection
        client = await pool.connect();

        // 3. Start transaction
        await client.query("BEGIN");

        // 4. Update existing expired subscription
        const updateSubscription = await client.query(
            `UPDATE provider_subscription
             SET
                selected_services = $1,
                gst_rate = $2,
                gst_amount = $3,
                base_amount = $4,
                total_amount = $5,
                started_at = CURRENT_TIMESTAMP,
                expires_at = CURRENT_TIMESTAMP + INTERVAL '30 days',
                subscription_status = 'active'
             WHERE
                user_id = $6
                AND subscription_status = 'expired'
             RETURNING *`,
            [
                JSON.stringify(services),
                gstRate,
                gstAmount,
                baseAmount,
                totalPrice,
                userId
            ]
        );

        // 5. Check whether an expired subscription exists
        if (updateSubscription.rowCount === 0) {
            await client.query("ROLLBACK");

            return {
                status: 404,
                message: "No expired subscription found for this provider"
            };
        }

        const {
            subscription_id,
            started_at,
            expires_at
        } = updateSubscription.rows[0];

        // 6. Create subscription history entry
        await client.query(
            `INSERT INTO subscription_history
            (
                subscription_id,
                user_id,
                selected_services,
                base_amount,
                gst_rate,
                gst_amount,
                total_amount,
                started_at,
                expires_at,
                transaction_type,
                payment_status
            )
            VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [
                subscription_id,
                userId,
                JSON.stringify(services),
                baseAmount,
                gstRate,
                gstAmount,
                totalPrice,
                started_at,
                expires_at,
                "renewal",
                "paid"
            ]
        );

        // 7. Commit transaction
        await client.query("COMMIT");

        return {
            status: 200,
            message: "Subscription renewal successful",
            data: updateSubscription.rows[0]
        };
    } catch (error) {
        // Roll back any changes if an error occurs
        if (client) {
            await client.query("ROLLBACK").catch(() => {});
        }

        console.error("Subscription renewal failed:", error);

        return {
            status: 500,
            message: "Internal server error"
        };
    } finally {
        // 8. Release the connection
        if (client) {
            client.release();
        }
    }
};

module.exports = {providerSubscriptionCost,createProviderSubscription,renewProviderSubscription,getProviderSubscriptionDetails}