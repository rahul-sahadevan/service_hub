const pool = require("../db")
const getPlans = require("../Models/plansModel")


const plansController = async(req,res)=>{
    try{
        // call function to get plans from DB
        const plansDb = await getPlans()
        return res.status(200).json(plansDb)

    }
    catch(error){
        return res.status(500).json({
            status:500,
            message:"Internale server error, Failed to get plan details"
        })
    }
}

module.exports = plansController