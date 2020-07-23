require("dotenv").config();
const express = require("express");
const axios = require("axios");
const convert = require("xml-js");
const rateLimit = require("express-rate-limit");
const path = require("path");
const bodyParser = require("body-parser");
const listRouter = require("./routes/lists");
const bookRouter = require("./routes/books");

const app = express();
app.use(bodyParser.json());

// Serve static files from React app
app.use(express.static(path.join(__dirname, "client/build")));

app.use("/api/lists", listRouter);
app.use("/api/books", bookRouter);

// For any request that doesn't match above, send back React index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

const port = process.env.PORT || 5000;
app.listen(port);

// const { Client } = require("pg");

// const client = new Client({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false,
//   },
// });

// client.connect();

// client.query(
//   "SELECT table_schema,table_name FROM information_schema.tables;",
//   (err, res) => {
//     if (err) throw err;
//     for (let row of res.rows) {
//       console.log(JSON.stringify(row));
//     }
//     client.end();
//   }
// );
const Sequelize = require("sequelize");
const sequelize = new Sequelize(process.env.DATABASE_URL);
sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })

  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

console.log(`Server listening on ${port}`);
