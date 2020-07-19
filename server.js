require("dotenv").config();
const express = require("express");
const axios = require("axios");
const convert = require("xml-js");
const rateLimit = require("express-rate-limit");
const path = require("path");
const bodyParser = require("body-parser");
const listRouter = require("./routes/lists");

const app = express();
app.use(bodyParser.json());

// Serve static files from React app
app.use(express.static(path.join(__dirname, "client/build")));

app.use("/api/lists", listRouter);

app.get("/api/search", async (req, res) => {
  try {
    //const searchString = `q=${req.query.q}`
    const searchString = "hello";
    axios
      .get(
        `https://www.goodreads.com/search/index.xml?key=${process.env.GOODREADS_API_KEY}&${searchString}`
      )
      .then((resp) => {
        const xml = resp.data;
        const json = convert.xml2json(xml, { compact: true, spaces: 2 });
        const results = JSON.parse(json);
        console.log(results);

        return res.json({
          success: true,
          results,
        });
      });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// For any request that doesn't match above, send back React index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log(`Server listening on ${port}`);
