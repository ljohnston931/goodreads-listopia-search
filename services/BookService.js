const axios = require("axios");

class BookService {
  async search(query) {
    console.log(".......");
    const resp = await axios.get(
      "https://www.googleapis.com/books/v1/volumes",
      { params: { q: query, maxResults: 5 } }
    );
    return resp.data.items
      .map((item) => {
        try {
          const volumeInfo = item.volumeInfo;
          return {
            label: `${volumeInfo.title} by ${volumeInfo.authors[0]}`,
            value: volumeInfo.industryIdentifiers[0].identifier,
          };
        } catch (error) {
          return null;
        }
      })
      .filter((item) => item)
      .slice(0, 3);
  }
}

module.exports = BookService;
