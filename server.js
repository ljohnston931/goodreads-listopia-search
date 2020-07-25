require("dotenv").config();
const express = require("express");
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

const db = require("./models/index");
db.sequelize.sync();
const port = process.env.PORT || 5000;
app.listen(port);

console.log(`Server listening on ${port}`);

// const AuthorService = require("./services/AuthorService");
// const as = new AuthorService();
// as.getBooksByAuthorFromGoodreads(8885).then((res) => console.log(res));

// const ids = [29906980, 786699, 13641208, 6759, 26893819, 4667024];
// const ListService = require("./services/ListService");
// const ls = new ListService();
// let start = new Date();
// console.log("a");
// ls.getListsFromDatabase(ids).then(() => {
//   console.log(new Date() - start);
//   start = new Date();
//   ls.getListsB(ids).then(() => {
//     console.log(new Date() - start);
//     start = new Date();
//     ls.getListsFromDatabase(ids).then(() => {
//       console.log(new Date() - start);
//     });
//   });
// });
