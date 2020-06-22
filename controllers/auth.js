const crypto = require("crypto");

const User = require("../models/user");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendGridTransport = require("nodemailer-sendgrid-transport");
const { validationResult } = require("express-validator/check");
const user = require("../models/user");

const { emailApi } = require("../config.json");

const transporter = nodemailer.createTransport(
     sendGridTransport({
          auth: {
               api_key: emailApi,
          },
     })
);
exports.getLogin = (req, res, next) => {
     //const isLoggedIn = req.get("Cookie").split("=")[1] === "true";

     res.render("auth/login", {
          pageTitle: "Login",
          path: "login",
     });
};

exports.getSignUp = (req, res, next) => {
     //const isLoggedIn = req.get("Cookie").split("=")[1] === "true";

     res.render("auth/sign-up", {
          pageTitle: "Sign Up",
          path: "sign-up",
          isAuthenticated: false,
          csrfToken: req.csrfToken(),
     });
};

exports.postSignUp = (req, res, next) => {
     const email = req.body.email;
     const password = req.body.password;
     const confirmPassword = req.body.confirmPassword;
     const errors = validationResult(req);
     console.log(errors);
     if (!errors.isEmpty()) {
          console.log(errors);
          return res.status(422).render("auth/sign-up", {
               pageTitle: "Sign Up",
               path: "sign-up",
               errorMessage: errors.array(),
          });
     }
     User.findOne({ email: email })
          .then((userDoc) => {
               if (userDoc) {
                    console.log("YAYYYYYYYYYYYYYYYYY", userDoc);
                    req.flash("error", "That Email is already taken! Please choose another ! ");
                    return res.redirect("/sign-up");
               } else {
                    bcrypt
                         .hash(password, 12)
                         .then((hashedPassword) => {
                              const newUser = new User({
                                   email: email,
                                   password: hashedPassword,
                                   cart: { items: [] },
                              });
                              return newUser.save().then((result) => {
                                   req.flash(
                                        "message",
                                        "Congratulations! You have successfully Signed up!"
                                   );
                                   res.redirect("/login");
                                   return transporter.sendMail({
                                        to: email,
                                        from: "shop@craftnepal.host",
                                        subject: "Signup succeeded",
                                        html: `<h1>You have successfully signed up in our website</h1><h2>Hi ${email}Please proceed and login to you account using your password. </h2>`,
                                   });
                              });
                         })
                         .catch((err) => console.log(err));
               }
          })

          .catch((err) => {
               console.log(err);
          });
};

exports.postLogin = (req, res, next) => {
     const email = req.body.email;
     console.log("Email", email);
     let userDoc;
     User.findOne({ email: email })
          .then((user) => {
               if (!user) {
                    console.log("NO USERS FOUND");
                    req.flash("error", "That Email is not registered");
                    return res.redirect("/login");
               } else {
                    const password = req.body.password;

                    bcrypt
                         .compare(password, user.password)
                         .then(
                              (result) => {
                                   if (result) {
                                        console.log("successfully authenticated ");
                                        req.flash("message", "Successfully Logged In ! ");
                                        req.session.user = user;
                                        req.session.save(() => {
                                             req.session.isLoggedIn = true;
                                             return res.redirect("/");
                                        });
                                   } else {
                                        console.log("INCORRECT PASSWORD");
                                        req.flash("error", "Invalid Email or Password");
                                        res.redirect("/login");
                                   }
                              }

                              //
                         )
                         .catch((err) => {
                              console.log(err);
                              req.flash("error", "Something Went Wrong");
                              return res.redirect("/login");
                         });
               }
          })

          .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
     // res.setHeader("Set-Cookie", "loggedIn=true; HttpOnly"); //httpOnly to disawllow clientside javascript to use it.

     //using session insstead (express - session required)

     req.flash("message", "Logged out!");
     req.session.destroy(() => {
          console.log(req.session);

          res.redirect("/");
     });
};

exports.getReset = (req, res, next) => {
     res.render("auth/reset-password", {
          pageTitle: "Reset Password",
          path: "reset-password",
     });
};

exports.postResetController = (req, res, next) => {
     crypto.randomBytes(32, (err, buffer) => {
          if (err) {
               console.log(err);
               return res.redirect("/reset");
          }
          const token = buffer.toString("hex");
          User.findOne({ email: req.body.email })
               .then((user) => {
                    if (!user) {
                         req.flash("error", "No such Email was found !");
                         return res.redirect("/reset-password");
                    } else {
                         user.resetToken = token;
                         user.resetTokenExpiration = Date.now() + 1000 * 60 * 60;
                         return user.save().then((result) => {
                              console.log("I am supposed to send the password reset token");

                              transporter.sendMail({
                                   to: req.body.email,
                                   from: "subuacharya19@craftnepal.host",
                                   subject: "Password Reset",
                                   html: `
                                   <p> You requested a password reset</p>
                                   <p> Click this <a href="http://localhost/new-password/${token}">link</a> to set a new password.</p>
                                   <p>If the link doesn't work, please paste this link to your brower addressbar : </p>
                                   <p>http://localhost/new-password/${token}</p>
                                   `,
                              });

                              return res.redirect("/shop  ");
                         });
                    }
               })

               .catch((err) => console.log(err));
     });
};
exports.getNewPassword = (req, res, next) => {
     const token = req.params.token;
     console.log(token);

     User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
          .then((user) => {
               if (!user) {
                    req.flash("error", "The Password Reset Token is INVALID or Has Expired :(");
                    return res.redirect("/login");
               }

               res.render("auth/new-password", {
                    pageTitle: "Reset Password",
                    path: "new-password",
                    user: user,
               });
          })
          .catch((err) => console.log(err));
};

exports.postNewPassword = (req, res, next) => {
     const newPassword = req.body.password;
     const userId = req.body.userId;
     console.log("User iD:", userId);
     Promise.all([User.findOne({ _id: userId }), bcrypt.hash(newPassword, 12)])
          .then((results) => {
               const user = results[0];
               const hashedPassword = results[1];

               user.password = hashedPassword;
               return user.save();
          })
          .then(() => {
               req.flash("message", "Successfully Reset Password");
               res.redirect("/login");
          })
          .catch((err) => console.log(err));
};
