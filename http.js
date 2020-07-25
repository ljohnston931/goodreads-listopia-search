const axios = require("axios");
const rateLimit = require("axios-rate-limit");

module.exports = rateLimit(axios.create(), {
  maxRequests: 1,
  perMilliseconds: 1000,
});
