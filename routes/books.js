const express = require("express");
const bookController = require("../controllers/bookController");

const bookRouter = express.Router();

bookRouter.get("/", bookController.search);

module.exports = bookRouter;
