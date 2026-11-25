const express =  require("express")
const dotenv = require("dotenv")
const cors = require("cors")
const http = require("http")
const authRouter = require("./Routes/authRouter")
const providerRouter = require("./Routes/providerRoute")
const plansRouter = require("./Routes/plansRouter")
const cookieParser = require("cookie-parser")
const {sessionCronJob,providerSubscriptionCron} = require("./Services/sessionExpiryCheck")


// create express app 
const app = express()

// create httpSever
const httpServer = http.createServer(app)

// configure dotenv
dotenv.config()

// PORT
const PORT = process.env.PORT


// middlewares
// cors middle ware
app.use(cors({
    origin:'http://localhost:5173',
    methods:["GET","POST","PUT","DELETE"],
    credentials:true
}))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended:true}))


// routes-------------------------------------
app.get("/",(req,res)=>{
    return res.send("Server is up and running")
})
app.use('/api/auth',authRouter) // user authentication router
app.use('/api/provider',providerRouter) // provider router
app.use('/api/plans',plansRouter) //plans router

// cron jobs ----------------------------------
sessionCronJob() // session expiry check for login session
providerSubscriptionCron() // session expiry check for provider subscription


// server call --------------------------------
httpServer.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})