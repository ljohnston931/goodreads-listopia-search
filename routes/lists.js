const express = require("express");
const listController = require("../controllers/listController");

const listRouter = express.Router();

listRouter.get("/in-common", listController.getListsInCommon);

module.exports = listRouter;
