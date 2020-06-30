const path = require("path");
const rootDir = require("../helpers/path.js");

const shopController = require("../controllers/shop.js");

const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/is-auth");

router.get("/product-list", shopController.getProducts);

// router.get("product/delete", )

router.get("/products/:productId", shopController.getProductDetail);

// router.get("/checkout", shopController.getCheckout);

router.get("/cart", isAuth, shopController.getCart);

router.post("/cart/remove/:productId", isAuth, shopController.removeFromCart);

router.post("/cart", isAuth, shopController.postCart);

router.get("/orders", isAuth, shopController.getOrders);

router.get("/create-order", isAuth, shopController.postCreateOrder);
router.post("/invoice/:orderId", isAuth, shopController.postSendInvoice);

router.get("/", shopController.getIndex);

module.exports = router;
