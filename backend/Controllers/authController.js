const pool = require("../db")
const validator = require("validator")
const bcrypt = require("bcrypt")
const { registerValidator } = require("../Utils/userValidator")
const { registerUser, checkLoginExist,logoutUser} = require("../Models/authModel")


// register user
const registerUserController = async(req,res)=>{
    try{
        const {email,username,password} = req.body
        console.log(email,username,password)

        // validator function to check the user input
        const userValidation = await registerValidator({email,username,password})

        // create bcruypt password
        const hashedPassword = await bcrypt.hash(password,10)
        
        // add user to db
        const registerDb = await registerUser({email,username,hashedPassword})

        return res.send(registerDb)


    }
    catch(error){
        return res.send({
            status:500,
            message:"Internal Server Error!",
            error
        })
    }
}

// login user

const loginUserController =  async(req,res)=>{
    try{
        const {loginId,loginPassword} = req.body
        console.log(loginId,loginPassword)

        // verify the loginId and password is not empty
        if(!loginId || !loginPassword){
            return res.send({
                status:400,
                message:"All fields required"
            })
        }

        // verify the login id and password with db
        const checkUser = await checkLoginExist({loginId,loginPassword})
        if(checkUser.status !== 200){
            return res.send(checkUser)
        }

        res.cookie(
            "session_token",
            checkUser.session_token,{
                httpOnly:true,
                sameSite:"lax",
                secure: process.env.NODE_ENV === "production",
                path: "/",
                maxAge: 60 * 60 * 1000
            }
        )

        return res.send({
            status:200,
            message:"Login succesful",
        })

    }
    catch(error){
        console.log(error)
        return res.send({
            status:500,
            message:"Internal Server Error",
            error
        })
    }
}

//logout user

const logoutController =  async(req,res)=>{
    try{

        const {session_token} = req.cookies
        console.log(session_token,"sesion token from logout")

        if(!session_token){
            return res.send({
                status:400,
                message:"No active session found"
            })
        }

        // remove session token from DB

        const removeSessionToken =  await logoutUser({session_token})

        // if(removeSessionToken.status !== 200){
        //     return res.send({
        //         status:500,
        //         message:"Internal Server Error",
        //         error:removeSessionToken
        //     })
        // }

        res.clearCookie("session_token",{
            httpOnly:true,
            sameSite:"lax",
            secure:process.env.NODE_ENV === "production",
            path: "/"
        })

        return res.send({
            status:200,
            message:"Login succesfull!"
        })

    }
    catch(error){
        return res.send({
            status:500,
            message:"Internal Server Error",
            error:error
        })
    }
}

module.exports = {registerUserController,loginUserController,logoutController}