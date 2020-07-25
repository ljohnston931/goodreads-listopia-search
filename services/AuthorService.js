const axios = require("axios");
const convert = require("xml-js");
const _ = require("lodash");
const { query } = require("express");
require("dotenv").config();
const db = require("../models/index");
const { Op } = require("sequelize");

class AuthorService {
  async getBooksByAuthor(authorId) {
    //const bookIds = db.booksbyAuthor
    return await this.getBooksByAuthorFromGoodreads(authorId);
  }

  async getBooksByAuthorFromGoodreads(authorId) {
    let bookIds = [];
    let getAnotherPage = true;
    let page = 1;

    while (getAnotherPage) {
      const resp = await axios.get(
        `https://www.goodreads.com/author/list.xml`,
        {
          params: {
            key: process.env.GOODREADS_API_KEY,
            id: authorId,
            page: page,
          },
        }
      );
      const json = convert.xml2json(resp.data, { compact: true, spaces: 2 });
      const results = JSON.parse(json).GoodreadsResponse.author.books;
      let books = results.book;
      if (!(books instanceof Array)) {
        books = [books];
      }
      bookIds = bookIds.concat(books.map((book) => book.id._text));
      getAnotherPage = results._attributes.end !== results._attributes.total;
      page++;
    }

    return bookIds;
  }
}

module.exports = AuthorService;
