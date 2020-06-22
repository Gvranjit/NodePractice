const router = require("express").Router();
const authController = require("../controllers/auth");
const { check } = require("express-validator/check");

router.get("/login", authController.getLogin);

router.post("/login", authController.postLogin);

router.get("/sign-up", authController.getSignUp);

router.post(
     "/sign-up",
     check("email").isEmail().withMessage("Please Enter a valid email"),
     //  check("password").equals("confirmPassword").withMessage("Passwords Do Not Match"),
     authController.postSignUp
);

router.get("/logout", authController.postLogout);

router.get("/reset-password", authController.getReset);

router.post(
     "/reset-password",
     check("email").isEmail().withMessage("Please Enter a valid email"),
     authController.postResetController
);

router.get("/new-password/:token", authController.getNewPassword);

router.post("/new-password/", authController.postNewPassword);

module.exports = router;
