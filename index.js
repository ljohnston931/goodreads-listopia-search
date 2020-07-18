const express = require("express");
const path = require("path");
const generatePassword = require("password-generator");

const app = express();

// Serve static files from React app
app.use(express.static(path.join(__dirname, "client/build")));

// Put all API endpoints under '/api'
app.get("/api/passwords", (req, res) => {
  const count = 5;
  const passwords = Array.from(Array(count).keys()).map((i) =>
    generatePassword(12, false)
  );
  res.json(passwords);
  console.log(`Sent ${count} passwords`);
});

// For any request that doesn't match above, send back React index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log(`Password generator listening on ${port}`);
