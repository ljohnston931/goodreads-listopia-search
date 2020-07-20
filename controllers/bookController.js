const BookService = require("../services/BookService");
const BookServiceInstance = new BookService();

exports.search = async (req, res) => {
  if (!req.query || !req.query.q) {
    res.status(400).send("Parameter 'q' is missing");
  }

  try {
    const results = await BookServiceInstance.search(req.query.q);
    res.send(results);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};
