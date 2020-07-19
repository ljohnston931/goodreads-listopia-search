const axios = require("axios");
const _ = require("lodash");
const cheerio = require("cheerio");

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
    let start = new Date();
    const [bookLists, authorLists] = await Promise.all([
      this.getBookLists(bookIds),
      this.getAuthorLists(authorIds),
    ]);
    console.log("get lists", new Date() - start);
    start = new Date();
    const arraysToCompare = bookLists
      .map((bookList) => bookList.lists)
      .concat(authorLists.map((authorList) => authorList.lists));
    const listsInCommon = _.intersectionBy(...arraysToCompare, "href");
    console.log("compare lists", new Date() - start);
    return listsInCommon;
  }

  async getBookLists(bookIds) {
    return Promise.all(
      bookIds.map((bookId) => {
        return this.getListsForBook(bookId).then((lists) => {
          return { bookId, lists };
        });
      })
    );
  }

  async getListsForBook(bookId) {
    let start = new Date();
    console.log("starting ", bookId);
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
    console.log("end", "book:", bookId, new Date() - start);
    return firstPageLists.concat(_.flatten(otherPagesLists));
  }

  async getAuthorLists(authorIds) {
    return Promise.resolve([]);
    /* [
            [
                authorId: ***,
                lists: [
                    {
                        title,
                        imgs,
                        link,
                        id
                    }
                ]
            ]
        ]*/
  }
}

module.exports = ListService;
