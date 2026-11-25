const express = require("express")
const plansController = require("../Controllers/plansController")
const router = express.Router()


router.get("/get-plans",plansController)

module.exports = router