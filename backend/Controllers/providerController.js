const pool = require("../db")
const { providerSubscriptionCost, createProviderSubscription, renewProviderSubscription,getProviderSubscriptionDetails } = require("../Models/providerModel")


// provider plan price calculation
const providerPriceController = async(req,res)=>{
    try{

        const {plans} = req.body
        console.log(plans)

        // check if the plans are empty
        if(!plans){
            return res.send({
                status:400,
                message:"Please choose plan"
            })
        }

        // find the prices for the plans selected
        const totalPriceData = await providerSubscriptionCost({plans})
        return res.send({
            status:200,
            message:"Total price calculation succesful",
            data:totalPriceData
        })

    }
    catch(error){
        return res.send({
            status:500,
            message:"Internal server error",
            error
        })
    }
}

// provider subscription creation
const providerSubscriptionController = async(req,res)=>{
    try{
        // user id
        const userId = req.user.user_id

        // payload from frontend
        const {services,gstRate,gstAmount,baseAmount,totalPrice} = req.body

        // check payment status
        const payment_status = true
        if(!payment_status){
            return res.send({
                status:400,
                message:"Pyament failed!"
            })
        }

        // verify the calculated amounts are correct
        let plans = services.map((service) => service.plan)
        const verifyProviderCost =  await providerSubscriptionCost({plans})
        console.log(verifyProviderCost)

        if(
            Number(verifyProviderCost.gstRate) !== Number(gstRate)
            || Number(verifyProviderCost.baseAmount) !== Number(baseAmount) 
            || Number(verifyProviderCost.totalPrice) !== Number(totalPrice)
            || Number(verifyProviderCost.gstAmount !== Number(gstAmount))
        ){
            return res.send({
                status:400,
                message:"Price calculation failed",
            })
        }

        // once the payment succesfuly proceed with creat new provider subscription
        const subscriptionCreation = await createProviderSubscription({services,gstRate,gstAmount,baseAmount,totalPrice,userId})
        console.log(subscriptionCreation)

        if(subscriptionCreation.status !== 201 ){
            return res.send(subscriptionCreation)
        }

        return res.send({
            status:201,
            message:"Subscription is created succesfully",
        })
        

    }
    catch(error){
        console.log(error)
        return res.send({
            status:500,
            message:"Internal server error",
            error
        })
    }
}

// get provder subscription details
const getProviderSubscription = async(req,res)=>{
    try{

        const userId = req.user.user_id
        const subscriptionDetails = await getProviderSubscriptionDetails({userId})

        if(subscriptionDetails.status !== 200){
            return res.status(subscriptionDetails.status).json(subscriptionDetails)
        }

        return res.status(200).json(subscriptionDetails)

    }
    catch(error){
        return res.status(500).json({
            status:500,
            message:"Internal server error",
            error: error.message?.error
        })
    }
}

// provider subscription renewal
const providerSubscriptionRenewal = async(req,res)=>{
    try{

        const {isRenewal,data} = req.body
        const {services,gstRate,gstAmount,baseAmount,totalPrice} = data
        console.log(req.user)
        const userId = req.user.user_id
        console.log(isRenewal,data,userId)

        // check if the renewal flag is enabled or not
        if(!isRenewal){
            return res.status(400).json({
                status:400,
                message:"Renewal failed!"
            })
        }

        // call function to renew subscription or update the DB
        const renewlResult = await renewProviderSubscription({services,gstRate,gstAmount,baseAmount,totalPrice,userId})

        return res.status(200).json(renewlResult)


    }
    catch(error){
        console.log("renewal api error",error)
        return res.status(500).json({
            status:500,
            message:"Internal server error",
        })
    }
}




module.exports = {providerPriceController,providerSubscriptionController,providerSubscriptionRenewal,getProviderSubscription}