const { check, body } = require("express-validator");
const { passwordFormat } = require("../config.json");
const User = require("../models/user");

exports.checkEmailNotExist = check("email")
     .isEmail()
     .withMessage("Please Enter a valid email")
     .custom((value, { req }) => {
          console.log("I AM NOT SUPPOSED TO REACH HERE AT ALL _____________________________");

          return User.findOne({ email: value }).then((userDoc) => {
               if (userDoc) {
                    return Promise.reject("That Email is already taken! Please choose another ! ");
               }
               return true;
          });
     })
     .normalizeEmail();

exports.checkPasswordMatches = body("password")
     .custom((value, { req }) => {
          if (value !== req.body.confirmPassword) {
               throw new Error("Passwords do not match");
          }
          return true;
     })
     .trim();

exports.checkEmailValid = check("email")
     .notEmpty()
     .withMessage("The Email field must not be empty")
     .isEmail()
     .withMessage("This is not a valid Email");

exports.passwordFormatted = check("password").custom((password) => {
     console.log(password);
     if (
          !password.match(/(((.?)+[A-Z](.?))((.?)+[a-z](.?)))|(((.?)+[a-z](.?))((.?)+[A-Z](.?)))/gm)
     ) {
          throw "Passwords must be a combination of capital and small letters [Aa-Zz]";
     }
     return true;
});

// ** Checks / Validations for Admin Routes ** //

exports.checkBookDetails = [
     body("title").isString().isLength({ min: 3 }).trim(),
     body("imageUrl").isURL(),
     body("price").isFloat(),
     body("description").isLength({ min: 5, max: 400 }),
];
