//will delete this file
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
        let bookLists = await db.lists.findAll({
          attributes: ["list_title", "list_href"],
          where: { book_id: bookId },
        });

        if (!bookLists.length) {
          bookLists = await this.getListsForBookFromGoodreads(bookId);
        }

        return {
          bookId,
          lists: bookLists.map((list) => {
            return { title: list.list_title, href: list.list_href };
          }),
        };
      })
    );
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

  async getAuthorLists(authorIds) {
    return await Promise.all(
      authorIds.map(async (authorId) => this.getListsForAuthor(authorId))
    );
  }

  async getListsForAuthor(authorId) {
    const bookIds = await AuthorServiceInstance.getBooksByAuthor(authorId);
    const bookListsFromDatabase = await db.lists.findAll({
      attributes: ["book_id", "list_title", "list_href"],
      where: { book_id: bookIds },
    });
    const bookIdsInDatabase = [
      ...new Set(bookListsFromDatabase.map((list) => list.book_id)),
    ];
    const bookIdsNotInDatabase = bookIds.filter(
      (bookId) => !bookIdsInDatabase.includes(bookId)
    );
    console.log("ids in database", bookIdsInDatabase);
    console.log("ids not in database", bookIdsNotInDatabase);
    const bookListsFromGoodreads = await Promise.all(
      bookIdsNotInDatabase.map((bookId) =>
        this.getListsForBookFromGoodreads(bookId)
      )
    );
    let lists = bookListsFromDatabase.concat(bookListsFromGoodreads);
    lists = _.flatten(lists);
    lists = lists.map((list) => {
      return { title: list.list_title, href: list.list_href };
    });
    return { authorId: authorId, lists: lists };
  }
}

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

module.exports = ListService;
