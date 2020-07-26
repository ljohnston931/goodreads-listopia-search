const axios = require("axios");
const rateLimit = require("axios-rate-limit");

const slow = rateLimit(axios.create(), {
  maxRequests: 1,
  perMilliseconds: 1000,
});

const medium = rateLimit(axios.create(), {
  maxRequests: 2,
  perMilliseconds: 1000,
});

const fast = axios;

module.exports = { slow, medium, fast };
