const pool = require("../db")
const bcrypt = require("bcrypt")
const crypto = require("crypto")

// fucntion to add the user registration to db
const registerUser = async({email,username,hashedPassword})=>{
    try{

        console.log(username,"username from model")
        // check if the user already exit in the DB
        const checkUserExist =  await pool.query("SELECT * FROM users WHERE email=$1 OR username=$2",[email,username])
        console.log(checkUserExist.rowCount,"check user exist")
        if(checkUserExist.rowCount > 0){
            return {
                status:400,
                message:"User alrady exist, Please provier different username or email"                
            }
        }
        const registerDb = await pool.query("INSERT INTO users (email,username,password_hash) VALUES ($1,$2,$3) RETURNING*",[email,username,hashedPassword])
        const registerOut = registerDb.rows[0]
        return {
            status:201,
            message:"User registration successful!",
            data:{
                created_at:registerOut.created_at
            }
        }

    }
    catch(error){
        console.log(error)
        return error.message
    }
}


// login validation
const checkLoginExist = async({loginId,loginPassword})=>{

    try{
        const checkUserExistInDb = await pool.query("SELECT * FROM users WHERE username = $1 OR email = $1",[loginId])
        console.log(checkUserExistInDb.rows[0],"db validation for login")
        if(!checkUserExistInDb.rows[0]){
            return {
                status:400,
                message:"User is not exsting, Username or Email is wrong"
            }
        }
        const hashedPassword = checkUserExistInDb.rows[0].password_hash

        // compose the loginPassword with existing hashed password
        const comparePassword = await bcrypt.compare(loginPassword,hashedPassword)
        console.log(comparePassword)

        if(!comparePassword){
            return {
                status:400,
                message:"Username or Password incorrect!",
            }
        }

        // create a session token using crypto
        const session_token = crypto.randomUUID()
        console.log("sessionTokenCreation",session_token)

        // make the session_token hashed
        const hashedSessionToken = crypto
        .createHash("sha256")
        .update(session_token)
        .digest("hex")

        // add the login details to DB
        const loginDbEntry = await pool.query("INSERT INTO login_entries (user_id,session_token_hash) VALUES($1,$2) RETURNING *",[checkUserExistInDb.rows[0].user_id,hashedSessionToken])
        console.log(loginDbEntry.rows[0])

        return {
            status:200,
            message:"Login entry completed in DB!",
            session_token
        }


    }
    catch(error){
        console.log(error)
        return error.message
    }
}

// logout user
const logoutUser = async({session_token})=>{
    try{

        // convert the sesison_token to hash to compare
        const sesionTokenHashed = crypto
        .createHash("sha256")
        .update(session_token)
        .digest("hex")

        const removeSession = await pool.query("UPDATE login_entries SET loggedout_at = CURRENT_TIMESTAMP WHERE session_token_hash = $1 AND loggedout_at IS NULL RETURNING *",[sesionTokenHashed])
        console.log(removeSession.rows[0])

        return {
            status:200,
            message:"Session updated in DB"
        }


    }
    catch(error){
        console.log(error)
        return error
    }
}




module.exports = {registerUser,checkLoginExist,logoutUser}