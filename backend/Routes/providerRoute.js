const express = require("express")
const router = express.Router()
const {providerPriceController, providerSubscriptionController, providerSubscriptionRenewal,getProviderSubscription} = require("../Controllers/providerController")
const isAuth = require("../Middlewares/authMiddleware")


router.post("/price_cal",isAuth,providerPriceController)
router.post("/subscription",isAuth,providerSubscriptionController)
router.post("/renew",isAuth,providerSubscriptionRenewal)
router.get("/get-subscription",isAuth,getProviderSubscription)

module.exports = router