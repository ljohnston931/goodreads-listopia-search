require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const router = require("./router");

const app = express();
app.use(bodyParser.json());

// Serve static files from React app
app.use(express.static(path.join(__dirname, "client/build")));

app.use("/api", router);

// For any request that doesn't match above, send back React index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

const db = require("./models/index");

const port = process.env.PORT || 5000;
app.listen(port);

console.log(`Server listening on ${port}`);
