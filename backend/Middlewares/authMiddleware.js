const pool = require("../db")
const crypto = require("crypto")
const isAuth = async(req,res,next)=>{
    try{

        const {session_token} = req.cookies
        console.log(session_token)
        if(!session_token){
            return res.send({
                status:401,
                message:"Session not active, Please login first"
            })
        }
        const sessionTokenHasehd = crypto
            .createHash("sha256")
            .update(session_token)
            .digest("hex")

        const sessionDb = await pool.query("SELECT * FROM login_entries WHERE session_token_hash=$1",[sessionTokenHasehd])
        if(sessionDb.rows.length === 0){
            return res.send({
                status:401,
                message:"Session expired! Please login"
            })
        }

        req.user = sessionDb.rows[0]

        next()

    }
    catch(error){
        console.log(error)
        return error
    }
}

module.exports = isAuth