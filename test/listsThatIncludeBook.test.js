const chai = require("chai");
const expect = chai.expect;
const CONSTANTS = require("./TESTING_CONSTANTS.json");
//process.env.NODE_ENV = "test";
const ListsThatIncludeBookService = require("../services/ListsThatIncludeBookService");

describe("ListsThatIncludeBookService", () => {
  // describe("#areBooksListsInDatabase", () => {
  //   it("should return true if book lists are loaded in database", () => {
  //     expect([1, 2, 3].indexOf(4)).to.equal(-1);
  //   });
  //   it("should return false if book lists are not loaded in database", () => {
  //       expect([1, 2, 3].indexOf(4)).to.equal(-1);
  //     });
  // });

  describe("#scrapeBookListsPage", () => {
    it("should return empty array if no lists on page", async () => {
      const serviceInstance = new ListsThatIncludeBookService(
        CONSTANTS.BOOK_ID_WITH_NO_LISTS
      );
      const res = await serviceInstance.scrapeBookListsPage(1);
      expect(res.totalPages).to.equal(0);
      expect(res.lists).to.have.length(0);
    });
    it("should array with data and total pages if first page", async () => {
      const serviceInstance = new ListsThatIncludeBookService(
        CONSTANTS.BOOK_ID_WITH_MANY_LISTS
      );
      const res = await serviceInstance.scrapeBookListsPage(1);
      expect(res.totalPages).to.be.greaterThan(10);
      expect(res.lists).to.have.length(30);
    }).timeout(3000);
    it("should array with data and no total pages if not first page", async () => {
      const serviceInstance = new ListsThatIncludeBookService(
        CONSTANTS.BOOK_ID_WITH_MANY_LISTS
      );
      const res = await serviceInstance.scrapeBookListsPage(5);
      expect(res.lists).to.have.length(30);
    }).timeout(3000);
  });
});
