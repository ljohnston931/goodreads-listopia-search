const chai = require('chai')
const expect = chai.expect
const CONSTANTS = require('./TESTING_CONSTANTS.json')
const AuthorService = require('../services/AuthorService')
const db = require('../models/index')

describe.only('AuthorService', () => {
    describe('#getCachedAuthorBooks', () => {
        afterEach(async () => {
            await db.author_books.destroy({
                where: { author_id: CONSTANTS.AUTHOR_ID_WITH_NO_BOOKS },
            })
        })
        it("should return true if authors' books are loaded in database", async () => {
            await db.author_books.create({
                author_id: CONSTANTS.AUTHOR_ID_WITH_NO_BOOKS,
                book_id: CONSTANTS.AUTHOR_BOOKS[0],
            })
            const serviceInstance = new AuthorService(CONSTANTS.AUTHOR_ID_WITH_NO_BOOKS)
            const res = await serviceInstance.getCachedAuthorBooks()
            expect(res).to.be.true
        })
        it("should return false if authors' books are not loaded in database", async () => {
            const serviceInstance = new AuthorService(CONSTANTS.AUTHOR_ID_WITH_NO_BOOKS)
            const res = await serviceInstance.areAuthorBooksCached()
            expect(res).to.be.false
        })
    })

    describe('#getBooksFromGoodreads', () => {
        it('should return all books if less than 30', async () => {
            const serviceInstance = new AuthorService(CONSTANTS.AUTHOR_ID_WITH_FEW_BOOKS)
            const res = await serviceInstance.getBooks()
            expect(res.length).to.be.greaterThan(0)
            expect(res.length).to.be.lessThan(30)
        })
        it('should return a maximum of 30 books', async () => {
            const serviceInstance = new AuthorService(CONSTANTS.AUTHOR_ID_WITH_MANY_BOOKS)
            const res = await serviceInstance.getBooks()
            expect(res.length).to.equal(30)
        })
    })
    // What happens if a book is cached that's already in db?
    describe('#cacheBooks', () => {
        beforeEach(async () => {
            await db.author_books.destroy({
                where: { author_id: CONSTANTS.AUTHOR_ID_WITH_NO_BOOKS },
            })
        })
        afterEach(async () => {
            await db.author_books.destroy({
                where: { author_id: CONSTANTS.AUTHOR_ID_WITH_NO_BOOKS },
            })
        })

        it("should add authors' books to database", async () => {
            const serviceInstance = new AuthorService(CONSTANTS.AUTHOR_ID_WITH_NO_BOOKS)
            await serviceInstance.cacheBooks(CONSTANTS.AUTHOR_BOOKS)

            const authorBooksInDatabase = await db.lists.findAll({
                where: { author_id: CONSTANTS.AUTHOR_ID_WITH_NO_BOOKS },
            })

            expect(authorBooksInDatabase.length).to.equal(1)
            expect(bookListsInDatabase[0].author_id).to.equal(CONSTANTS.AUTHOR_ID_WITH_NO_BOOKS)
            expect(bookListsInDatabase[0].book_id).to.not.be.null
        })
    })
})
