const User = require("../models/user");

const router = require("express").Router();
const authController = require("../controllers/auth");
const { check, body } = require("express-validator");
const validator = require("../middleware/validator");

router.get("/login", authController.getLogin);

router.post("/login", validator.checkEmailValid, authController.postLogin);

router.get("/sign-up", authController.getSignUp);

router.post(
     "/sign-up",
     validator.checkEmailNotExist,
     validator.checkPasswordMatches,
     validator.passwordFormatted,
     authController.postSignUp
);

router.get("/logout", authController.postLogout);

router.get("/reset-password", authController.getReset);

router.post("/reset-password", validator.checkEmailValid, authController.postResetController);

router.get("/new-password/:token", authController.getNewPassword);

router.post("/new-password/", validator.checkPasswordMatches, authController.postNewPassword);

module.exports = router;
