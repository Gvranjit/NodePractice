const path = require("path");
const rootDir = require("../helpers/path.js");
const errorController = require("../controllers/errors.js");

const express = require("express");
const router = express.Router();
router.use("/", errorController.get404);

module.exports = router;
