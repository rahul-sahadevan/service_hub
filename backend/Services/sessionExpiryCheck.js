const cron = require("node-cron")
const pool = require("../db")

// cron job for checking login expired or not
const sessionCronJob = ()=>{

    cron.schedule('* 1 * * *',async()=>{
        try{

            const checkSesionExpiry = await pool.query("DELETE FROM login_entries WHERE expires_at < CURRENT_TIMESTAMP RETURNING *")
            console.log("session expired")
            return checkSesionExpiry.rows[0]

        }
        catch(error){
            console.log(error)
            return error
        }
    })
}

// cron to check if the provider subscription expired or not if expired mark active to expired
const providerSubscriptionCron = () => {
    cron.schedule('*/5 * * * *', async () => {
        try {
            const expiryCheck = await pool.query(`
                UPDATE provider_subscription
                SET subscription_status = 'expired'
                WHERE subscription_status = 'active'
                  AND expires_at <= CURRENT_TIMESTAMP
                RETURNING subscription_id, user_id, expires_at
            `);

            console.log("Expired subscriptions:", expiryCheck.rows);
        } catch (error) {
            console.error("Subscription expiry cron failed:", error);
        }
    });
};

module.exports = {sessionCronJob,providerSubscriptionCron}