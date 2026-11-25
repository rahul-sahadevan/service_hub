const validator = require("validator")

const registerValidator = ({email,username,password})=>{
    return new Promise((resolve,reject)=>{
        if(!email || !username || !password){
            reject("All fields are required!")
            return 
        }
        if(!validator.isEmail(email)){
            reject("Email is not valid!")
            return
        }
        if(!validator.isLength(username,{min:6,max:50})){
            reject("Username should have 6 to 50 letters")
            return
        }
        if(!validator.isLength(password,{min:6,max:50})){
            reject("Password should have 6 to 50 characters")
            return
        }

        resolve({status:200,message:"user validation done"})
        return

    })
}

module.exports = {registerValidator}