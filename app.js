const log = require("./logger"); // my own external logger function
//const http = require('http');
const path = require("path");
// const router = require('./router');
const { port } = require("./config.json");

const User = require("./models/user");
//third party modules
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const MongoDbStore = require("connect-mongodb-session")(session);
const mongoDbUri = "mongodb://localhost:27017/shop";
const csrf = require("csurf");

const flash = require("connect-flash");

const store = new MongoDbStore({
     uri: mongoDbUri,
     collection: "sessions",
});

const app = express();

const csrfProtection = csrf();

app.set("view engine", "ejs");
app.set("views", "views"); //First one is the reserved option and second is the value of folder

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const errorHandler = require("./routes/error");
const authRoutes = require("./routes/auth");

// const mongoConnect = require("./helpers/database").mongoConnect;

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.use(
     session({
          secret: "you are so funny",
          resave: false,
          saveUninitialized: false,
          store: store,
          // cookie: {
          //      maxAge: 10 * 1000,
          // },
     })
);

app.use(csrfProtection);

app.use(flash());

app.use((req, res, next) => {
     if (req.session.user) {
          User.findById(req.session.user._id)
               .then((user) => {
                    console.log(user);
                    req.session.user = user;
                    console.log(req.session);
                    next();
               })
               .catch((err) => console.log(err));
     } else {
          next();
     }
});

app.use((req, res, next) => {
     res.locals.isAuthenticated = req.session.isLoggedIn;
     res.locals.csrfToken = req.csrfToken();
     (res.locals.errorMessage = req.flash("error")), (res.locals.message = req.flash("message"));
     next();
});

//******************************************************************* */

app.use("/admin", adminRoutes);

app.use(shopRoutes);

app.use(authRoutes);

app.use(errorHandler);

//connection

mongoose
     .connect(mongoDbUri)

     .then(() => {
          app.listen(port);
     })
     .catch((err) => console.log(err));
