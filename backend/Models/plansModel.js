const pool = require("../db")


const getPlans = async()=>{
    try{

        // get plans from DB
        const plansDb = await pool.query("SELECT * FROM service_platform_plans")
        if(plansDb.rowCount === 0){
            return {
                status:500,
                message:"Failed to get plan dettails"
            }
        }
        console.log(plansDb.rows)
        return {
            status:200,
            message:"Plans fetched succesfully",
            data:plansDb.rows
        }
    }
    catch(error){
        console.log(error)
        return error
    }
}

module.exports = getPlans