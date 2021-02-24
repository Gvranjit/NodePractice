const path = require("path");

const express = require("express");

const router = express.Router();

const rootDir = require("../helpers/path");

const adminController = require("../controllers/admin.js");

const isAuth = require("../middleware/is-auth");

const validation = require("../middleware/validator");

router.get("/add-product", isAuth, adminController.getAddProduct);

router.post("/add-product", isAuth, validation.checkBookDetails, adminController.postAddProduct);

router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

router.delete("/delete-product/:productId", isAuth, adminController.deleteProduct);

router.post(
     "/edit-product",
     isAuth,
     validation.checkBookDetails,
     adminController.postUpdateProduct
);

// //router.get("/added-product", adminController.getAddedProduct);

router.get("/admin-product-list", isAuth, adminController.getAdminProductList);

module.exports = router;
