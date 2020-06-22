const path = require("path");

const express = require("express");

const router = express.Router();

const rootDir = require("../helpers/path");

const adminController = require("../controllers/admin.js");

const isAuth = require("../middleware/is-auth");

router.get("/add-product", isAuth, adminController.getAddProduct);

router.post("/add-product", isAuth, adminController.postAddProduct);

router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

router.post("/delete-product/:productId", isAuth, adminController.postDeleteProduct);

router.post("/edit-product", isAuth, adminController.postUpdateProduct);

// //router.get("/added-product", adminController.getAddedProduct);

router.get("/admin-product-list", isAuth, adminController.getAdminProductList);

module.exports = router;
