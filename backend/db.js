const {Pool} = require("pg")
const dotenv = require("dotenv")

dotenv.config()

const pool = new Pool({
    user:process.env.DB_USERNAME,
    password:process.env.DB_PASSWORD,
    host:process.env.DB_HOST,
    database:process.env.DB_NAME,
    port:Number(process.env.DB_PORT)
})

module.exports = pool
