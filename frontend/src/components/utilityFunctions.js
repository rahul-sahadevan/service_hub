import validator from "validator"

// function to validate the user input
export const userValidation = ({email,username,password})=>{
    console.log("calling user validation")
       if(validator.isEmpty(email) || validator.isEmpty(username) || validator.isEmpty(password)){
                console.log("All fields required!")
                alert("All fields required!")
        }
        if(!validator.isEmail(email)){
            alert("Please provide valid email address")
        }
        if(!validator.isLength(username,{min:6,max:50})){
            alert("Username should contain 6 to 50 charactors")
        }
        if(!validator.isLength(password,{min:6,max:50})){
            alert("Password should contain 6 to 50 values")
        }


}

// function check the session expiry
export const checkLoginSession = ()=>{
    
}