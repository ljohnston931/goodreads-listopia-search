const express = require('express')
const bookController = require('./controllers/bookController')
const listsInCommonController = require('./controllers/listsInCommonController')
const listsThatIncludeBookController = require('./controllers/listsThatIncludeBookController')
const authorController = require('./controllers/authorController')

const router = express.Router()

router.get('/books', bookController.search)
router.post('/books', bookController.getGoodreadsBooks)
router.post('/lists/in-common', listsInCommonController.getListsInCommon)

router.get('/cache/lists/:bookId', listsThatIncludeBookController.areBookListsCached)
router.get(
    '/goodreads/lists/:bookId/pages/:page',
    listsThatIncludeBookController.scrapeBookListsPage
)
router.post('/cache/lists/:bookId', listsThatIncludeBookController.cacheBookLists)

router.get('/cache/authors/:authorId/books', authorController.getBooks)

module.exports = router

// get     /bookIds                    bookController.getBookId()
// get     /cache/listContents         listContentsController.getListContentFromDatabase()
// get     /goodreads/listContents     listContentsController.scrapePage()
// post    /goodreads/listContents     listContentsController.cacheListContent()
// get     /listsInCommon              listsInCommonController.getListsInCommon()
// get     /books                      searchController.search()
