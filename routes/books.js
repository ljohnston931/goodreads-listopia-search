const express = require("express");
const bookController = require("../controllers/bookController");

const bookRouter = express.Router();

bookRouter.get("/", bookController.search);

bookRouter.post("/", bookController.getGoodreadsBooks);

module.exports = bookRouter;
