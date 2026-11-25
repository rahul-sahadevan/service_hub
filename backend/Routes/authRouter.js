const express = require("express")
const { registerUserController, loginUserController, logoutController } = require("../Controllers/authController")
const router = express.Router()


router.post('/register',registerUserController)
router.post("/login",loginUserController)
router.post("/logout",logoutController)


module.exports = router