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
const multer = require("multer");
const mongoose = require("mongoose");
const MongoDbStore = require("connect-mongodb-session")(session);
const mongoDbUri =
     "mongodb+srv://node_app:lovely@cluster0.ddjwp.gcp.mongodb.net/bookshop?retryWrites=true&w=majorit";
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

const fileStorage = multer.diskStorage({
     destination: (req, file, cb) => {
          cb(null, "public/images");
     },
     filename: (req, file, cb) => {
          cb(null, Date.now().toString() + "-" + file.originalname);
     },
});

const fileFilter = (req, file, cb) => {
     if (
          file.mimetype === "image/png" ||
          file.mimetype === "image/jpeg" ||
          file.mimetype === "image/jpg"
     ) {
          cb(null, true);
     } else {
          cb(null, false);
     }
};

// const mongoConnect = require("./helpers/database").mongoConnect;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single("image"));
app.use("/public", express.static(path.join(__dirname, "public")));
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
                    if (!user) {
                         return next();
                    }
                    console.log(user);
                    req.session.user = user;
                    console.log(req.session);
                    next();
               })
               .catch((err) => {
                    throw new Error(err);
               });
     } else {
          next();
     }
});

app.use((req, res, next) => {
     res.locals.isAuthenticated = req.session.isLoggedIn;
     res.locals.csrfToken = req.csrfToken();
     res.locals.errorMessage = req.flash("error");
     res.locals.message = req.flash("message");
     res.locals.oldInput = {};
     res.locals.hasError = false;
     next();
});

//******************************************************************* */

app.use("/admin", adminRoutes);

app.use(shopRoutes);

app.use(authRoutes);
app.use(errorHandler);

//System error message handler.I wanted to place this inside errorHandler, but somehow it doesn't work.
app.use((error, req, res, next) => {
     console.log(
          `The following System Error has Occured.\n Don't worry, I know you can solve this :)\n
          ooooooooooo oooooooooo  oooooooooo    ooooooo   oooooooooo  
          888         888    888  888    888 o888   888o  888    888 
          888ooo8     888oooo88   888oooo88  888     888  888oooo88  
          888         888  88o    888  88o   888o   o888  888  88o   
          o888ooo8888 o888o  88o8 o888o  88o8   88ooo88   o888o  88o8 \n`
     );
     console.log(error);
     res.status(500).render("500", {
          pageTitle: "ERROR",
          path: "Error",
          isAuthenticated: req.session.isLoggedIn,
          hasError: true,
          errorMessage: [],
          message: [],
     });
});

//connection

mongoose
     .connect(mongoDbUri)

     .then(() => {
          app.listen(port);
     })
     .catch((err) => console.log(err));
