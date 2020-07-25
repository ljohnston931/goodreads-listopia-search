const axios = require("axios");
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
        title: listTitle.text(),
        href: listTitle.attr("href").split("#")[0],
      };
    });

    return lists;
  }

  getTotalPages() {
    const nextPage = this.$("a.next_page");

    if (!nextPage) {
      if (this.$(".cell")) {
        return 1;
      }
      return 0;
    }

    const lastPage = parseInt(nextPage.prev().text());
    return lastPage;
  }
}

class ListService {
  async getListsInCommon(bookIds, authorIds) {
    const [bookLists, authorLists] = await Promise.all([
      this.getBookLists(bookIds),
      this.getAuthorLists(authorIds),
    ]);
    const arraysToCompare = bookLists
      .map((bookList) => bookList.lists)
      .concat(authorLists.map((authorList) => authorList.lists));
    const listsInCommon = _.intersectionBy(...arraysToCompare, "href");

    return listsInCommon;
  }

  async getBookLists(bookIds) {
    return Promise.all(
      bookIds.map(async (bookId) => {
        let bookLists = await db.lists.findAll({ where: { bookId: bookId } });
        if (bookLists.length) {
          return {
            bookId: bookId,
            lists: bookLists.map((list) => {
              return { title: list.listTitle, href: list.listHref };
            }),
          };
        }

        bookLists = await this.getListsForBookFromGoodreads(bookId);
        await db.lists.bulkCreate(
          bookLists.map((list) => {
            return {
              bookId: bookId,
              listTitle: list.title,
              listHref: list.href,
            };
          })
        );
        return { bookId, lists: bookLists };
      })
    );
  }

  async getListsForBookFromGoodreads(bookId) {
    const firstPageResp = await axios.get(
      `https://www.goodreads.com/list/book/${bookId}`
    );
    const parser = new HtmlParser(firstPageResp.data);
    const firstPageLists = parser.getListsOnPage();
    if (firstPageLists.length === 0) {
      return [];
    }
    const totalPages = parser.getTotalPages();
    const otherPages = _.range(2, totalPages + 1, 1);
    const otherPagesPromises = otherPages.map((pageNumber) =>
      axios.get(
        `https://www.goodreads.com/list/book/${bookId}?page=${pageNumber}`
      )
    );
    const otherPagesResp = await Promise.all(otherPagesPromises);
    const otherPagesLists = otherPagesResp.map((resp) => {
      const parser = new HtmlParser(resp.data);
      return parser.getListsOnPage();
    });
    return firstPageLists.concat(_.flatten(otherPagesLists));
  }

  async getAuthorLists(authorIds) {
    return await Promise.all(
      authorIds.map(async (authorId) => this.getListsForAuthor(authorId))
    );
  }

  async getListsForAuthor(authorId) {
    const bookIds = await AuthorServiceInstance.getBooksByAuthor(authorId);
    let lists = await Promise.all(
      bookIds.map((bookId) => this.getListsForBookFromGoodreads(bookId))
    );
    lists = _.flatten(lists);
    return { authorId: authorId, lists: lists };
  }
}

module.exports = ListService;
