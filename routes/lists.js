const express = require("express");
const listController = require("../controllers/listController");

const listRouter = express.Router();

listRouter.post("/in-common", listController.getListsInCommon);

module.exports = listRouter;
