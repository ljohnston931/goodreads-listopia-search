const express = require("express");
const bookController = require("./controllers/bookController");
const listController = require("./controllers/listController");

const router = express.Router();

router.get("/books", bookController.search);
router.post("/books", bookController.getGoodreadsBooks);
router.post("/lists/in-common", listController.getListsInCommon);

module.exports = router;
