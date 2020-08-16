const express = require('express')
const bookController = require('./controllers/bookController')
const listController = require('./controllers/listController')
const listsThatIncludeBookController = require('./controllers/listsThatIncludeBookController')

const router = express.Router()

router.get('/books', bookController.search)
router.post('/books', bookController.getGoodreadsBooks)
router.post('/lists/in-common', listController.getListsInCommon)

router.get('/cache/lists/:bookId', listsThatIncludeBookController.areBookListsCached)
router.get(
    '/goodreads/lists/:bookId/pages/:page',
    listsThatIncludeBookController.scrapeBookListsPage
)
router.post('/cache/lists/:bookId', listsThatIncludeBookController.cacheBookLists)

//router.get('/cache/authorBooks', authorController.areAuthorBooksCached())

module.exports = router

// get     /goodreads/authorBooks     authorController.scrapePage()
// post    /cache/authorBooks          authorController.cacheAuthorBooks()
// get     /bookIds                    bookController.getBookId()
// get     /cache/listContents         listContentsController.getListContentFromDatabase()
// get     /goodreads/listContents     listContentsController.scrapePage()
// post    /goodreads/listContents     listContentsController.cacheListContent()
// get     /listsInCommon              listsInCommonController.getListsInCommon()
// get     /books                      searchController.search()
