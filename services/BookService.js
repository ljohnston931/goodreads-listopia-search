const axios = require("axios");
const convert = require("xml-js");
const _ = require("lodash");
const { query } = require("express");
require("dotenv").config();
const db = require("../models/index");
const { Op } = require("sequelize");

class BookService {
  isSeries(item) {
    if (item.title.match(/series/i) || item.title.match(/collection/i)) {
      return true;
    }
  }
  async search(query) {
    const resp = await axios.get(
      "https://www.googleapis.com/books/v1/volumes",
      { params: { q: query, printType: "books" } }
    );
    const results = resp.data.items
      .map((item) => {
        try {
          return {
            title: item.volumeInfo.title,
            author: item.volumeInfo.authors[0],
          };
        } catch (error) {
          return null;
        }
      })
      .filter((item) => item)
      .filter((item) => !this.isSeries(item));
    const uniqueResults = _.uniqWith(results, _.isEqual);
    return uniqueResults;
  }

  async getGoodreadsBooks(queries) {
    const books = await Promise.all(
      queries.map((query) => this.findOrCreateBook(query))
    );
    return books;
  }

  async findOrCreateBook(query) {
    let book = await db.books.findOne({
      where: {
        [Op.and]: [{ title: query.title }, { author_name: query.author }],
      },
    });
    if (!book) {
      book = await this.searchGoodreads(query);
      await db.books.create(book);
    }
    return {
      bookId: book.book_id,
      title: book.title,
      author: {
        name: book.author_name,
        id: book.author_id,
      },
    };
  }

  async searchGoodreads(query) {
    const resp = await axios.get(`https://www.goodreads.com/search/index.xml`, {
      params: {
        key: process.env.GOODREADS_API_KEY,
        q: `${query.title} ${query.author}`,
      },
    });

    const json = convert.xml2json(resp.data, { compact: true, spaces: 2 });
    let results = JSON.parse(json).GoodreadsResponse.search.results.work;
    if (!(results instanceof Array)) {
      results = [results];
    }
    const goodreadsBook = results.find(
      (result) =>
        result.best_book.author.name._text === query.author &&
        result.best_book.title._text === query.title
    ).best_book;

    return {
      book_id: goodreadsBook.id._text,
      title: goodreadsBook.title._text,
      author_name: goodreadsBook.author.name._text,
      author_id: goodreadsBook.author.id._text,
    };
  }
}

module.exports = BookService;
