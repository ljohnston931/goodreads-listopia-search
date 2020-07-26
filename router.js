const express = require("express");
const bookController = require("./controllers/bookController");
const listController = require("./controllers/listController");

const router = express.Router();

router.get("/books", bookController.search);
router.post("/books", bookController.getGoodreadsBooks);
router.post("/lists/in-common", listController.getListsInCommon);

module.exports = router;

// get     /cache/authorBooks         authorController.areAuthorBooksInDatabase()
// get     /goodreads/authorBooks     authorController.scrapePage()
// post    /cache/authorBooks          authorController.cacheAuthorBooks()
// get     /bookIds                    bookController.getBookId()
// get     /cache/listContents         listContentsController.getListContentFromDatabase()
// get     /goodreads/listContents     listContentsController.scrapePage()
// post    /goodreads/listContents     listContentsController.cacheListContent()
// get     /listsInCommon              listsInCommonController.getListsInCommon()
// get     /cache/lists                listsThatIncludeBookController.areBookListsInDatabase()
// get     /goodreads/lists            listsThatIncludeBookController.scrapeBookListsPage()
// post    /cache/lists                listsThatIncludeBookController.cacheBookLists()
// get     /books                      searchController.search()
