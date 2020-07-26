const http = require("../http");
const _ = require("lodash");
const cheerio = require("cheerio");
const db = require("../models/index");
const AuthorService = require("./AuthorService");
const AuthorServiceInstance = new AuthorService();

class HtmlParser {
  constructor(document) {
    this.$ = cheerio.load(document);
  }

  getListsOnPage() {
    let lists = [];
    this.$(".cell").each((listIndex, cell) => {
      const listTitle = this.$(cell).find(".listTitle");
      lists[listIndex] = {
        list_title: listTitle.text(),
        list_href: listTitle.attr("href").split("#")[0],
      };
    });

    return lists;
  }

  getTotalPages() {
    const nextPage = this.$("a.next_page");

    if (!nextPage.length) {
      if (this.$(".cell").length) {
        return 1;
      }
      return 0;
    }

    const lastPage = parseInt(nextPage.prev().text());
    return lastPage;
  }
}

class ListSThatIncludeBookService {
  constructor(bookId) {
    this.bookId = bookId;
  }

  async scrapeBookListsPage(page) {
    const resp = await http.medium.get(
      `https://www.goodreads.com/list/book/${this.bookId}?page=${page}`
    );
    console.log("gotten");
    const parser = new HtmlParser(resp.data);
    let lists = parser.getListsOnPage();
    let totalPages = null;
    if (page === 1) {
      totalPages = parser.getTotalPages();
    }
    return {
      totalPages: totalPages,
      lists: lists,
    };
  }

  async getListsForBookFromGoodreads(bookId) {
    const firstPageResp = await http.medium.get(
      `https://www.goodreads.com/list/book/${bookId}`
    );

    const parser = new HtmlParser(firstPageResp.data);
    const firstPageLists = parser.getListsOnPage();
    if (firstPageLists.length === 0) {
      console.log("no lists for", bookId);
      await db.lists.create({
        book_id: bookId,
        list_title: null,
        list_href: null,
      });
      return [];
    }
    const totalPages = parser.getTotalPages();
    const otherPages = _.range(2, totalPages + 1, 1);
    const otherPagesPromises = otherPages.map(async (pageNumber) =>
      http.medium.get(
        `https://www.goodreads.com/list/book/${bookId}?page=${pageNumber}`
      )
    );
    const otherPagesResp = await Promise.all(otherPagesPromises);
    const otherPagesLists = otherPagesResp.map((resp) => {
      const parser = new HtmlParser(resp.data);
      return parser.getListsOnPage();
    });
    console.log("got lists for", bookId);
    const bookLists = firstPageLists.concat(_.flatten(otherPagesLists));

    await db.lists.bulkCreate(
      bookLists.map((list) => {
        return {
          book_id: bookId,
          list_title: list.list_title,
          list_href: list.list_href,
        };
      })
    );

    return bookLists;
  }
}

module.exports = ListSThatIncludeBookService;

// const { lists } = require("../models")

// constructor (bookId)

// areBookListsInDatabase {
//     return boolean
// }

// scrapeBookListsPage(page) {
//     data = scrapedData
//     if page = 1 {
//         data.totalPages = totalPages
//     }
//     return data
// }

// cacheBookLists(lists) {
//     store in database
// }
