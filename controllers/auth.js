const crypto = require("crypto");
const { password, emailSender } = require("../config.json");

const User = require("../models/user");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
// const sendGridTransport = require("nodemailer-sendgrid-transport");
const { validationResult } = require("express-validator");
const user = require("../models/user");

const { emailApi } = require("../config.json");

// const transporter = nodemailer.createTransport(
//      sendGridTransport({
//           auth: {
//                api_key: emailApi,
//           },
//      })
// );
const transporter = nodemailer.createTransport({
     host: "smtp-mail.outlook.com",
     port: 587,
     secureConnection: false,
     tls: {
          ciphers: "SSLv3",
     },
     auth: {
          user: emailSender,
          pass: password,
     },
});

exports.postLogin = (req, res, next) => {
     const email = req.body.email;
     console.log("Email", email);
     let userDoc;
     User.findOne({ email: email })
          .then((user) => {
               if (!user) {
                    console.log("NO USERS FOUND");

                    return res.status(422).render("auth/login", {
                         pageTitle: "Login",
                         path: "login",
                         errorMessage: [{ param: email, msg: "That Email is not registered" }],
                    });
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

                                        return res.status(422).render("auth/login", {
                                             pageTitle: "Login",
                                             path: "login",
                                             errorMessage: [
                                                  { param: password, msg: "Incorrect Password" },
                                             ],
                                        });
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
               oldInput: {
                    email: email,
                    password: password,
                    confirmPassword: confirmPassword,
               },
          });
     }

     bcrypt
          .hash(password, 12)
          .then((hashedPassword) => {
               const newUser = new User({
                    email: email,
                    password: hashedPassword,
                    cart: { items: [] },
               });
               return newUser.save().then((result) => {
                    req.flash("message", "Congratulations! You have successfully Signed up!");
                    res.redirect("/login");
                    return transporter.sendMail({
                         to: email,
                         from: emailSender,
                         subject: "Signup succeeded",
                         html: `<h1>You have successfully signed up in our website</h1><h2>Hi ${email}Please proceed and login to you account using your password. </h2>`,
                    });
               });
          })

          .catch((err) => {
               console.log(err);
          });
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
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
               console.log("I think there was an error", errors.errors);

               return res.status(422).render("auth/reset-password", {
                    pageTitle: "Reset Password",
                    path: "reset-password",
                    oldInput: { email: req.body.email },
                    errorMessage: errors.errors,
               });
          }

          const token = buffer.toString("hex");
          User.findOne({ email: req.body.email })
               .then((user) => {
                    if (!user) {
                         req.flash("error", "No such Email was found !");
                         return res.status(422).render("auth/reset-password", {
                              pageTitle: "Reset Password",
                              path: "reset-password",
                              oldInput: { email: req.body.email },
                         });
                    } else {
                         user.resetToken = token;
                         user.resetTokenExpiration = Date.now() + 1000 * 60 * 60;
                         return user.save().then((result) => {
                              console.log("I am supposed to send the password reset token");

                              transporter.sendMail({
                                   to: req.body.email,
                                   from: emailSender,
                                   subject: "Password Reset",
                                   html: `
                                   <p> You requested a password reset</p>
                                   <p> Click this <a href="http://gvranjit-60636.portmap.io:60636/new-password/${token}">link</a> to set a new password.</p>
                                   <p>If the link doesn't work, please paste this link to your brower addressbar : </p>
                                   <p>http://gvranjit-60636.portmap.io:60636/new-password/${token}</p>
                                   `,
                              });
                              req.flash(
                                   "message",
                                   "An Email was sent to you with the Password Reset Instructions"
                              );
                              return res.redirect("/login");
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
                    userEmail: user.email,
                    userId: user._id,
               });
          })
          .catch((err) => console.log(err));
};

exports.postNewPassword = (req, res, next) => {
     const errors = validationResult(req);
     const userId = req.body.userId;
     const userEmail = req.body.userEmail;
     console.log(errors);
     if (!errors.isEmpty()) {
          return res.render("auth/new-password", {
               pageTitle: "Reset Password",
               path: "new-password",
               userEmail: userEmail,
               userId: userId,
               errorMessage: errors.array(),
          });
     }
     const newPassword = req.body.password;

     console.log("User iD:", userId);
     Promise.all([User.findOne({ _id: userId }), bcrypt.hash(newPassword, 12)])
          .then((results) => {
               console.log('I SHOULDN"T REACH HERE ');
               const user = results[0];
               const hashedPassword = results[1];

               user.password = hashedPassword;
               return user.save();
          })
          .then(() => {
               req.flash("message", "Successfully Reset Password");
               transporter.sendMail({
                    from: emailSender,
                    to: userEmail,
                    subject: "Password Reset Success!",
                    text: "Congratulations, You have successfully reset your password.",
               });
               return res.redirect("/login");
          })
          .catch((err) => console.log(err));
};
