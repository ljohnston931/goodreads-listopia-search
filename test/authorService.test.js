const chai = require('chai')
const expect = chai.expect
const CONSTANTS = require('./TESTING_CONSTANTS.json')
const AuthorService = require('../services/AuthorService')
const db = require('../models/index')

describe('AuthorService', () => {
    it.only('temp', async () => {
        const serviceInstance = new AuthorService(CONSTANTS.AUTHOR_ID_WITH_FEW_BOOKS)
        const res = await serviceInstance.getBooks()
    })

    describe('#getBooks', () => {
        beforeEach(async () => {
            await db.author_books.destroy({
                where: {
                    author_id: [
                        CONSTANTS.AUTHOR_ID_WITH_NO_BOOKS,
                        CONSTANTS.AUTHOR_ID_WITH_MANY_BOOKS,
                    ],
                },
            })
        })
        afterEach(async () => {
            await db.author_books.destroy({
                where: {
                    author_id: [
                        CONSTANTS.AUTHOR_ID_WITH_NO_BOOKS,
                        CONSTANTS.AUTHOR_ID_WITH_MANY_BOOKS,
                    ],
                },
            })
        })

        it('should return all books if less than 30', async () => {
            const serviceInstance = new AuthorService(CONSTANTS.AUTHOR_ID_WITH_FEW_BOOKS)
            const res = await serviceInstance.getBooks()

            expect(res.length).to.be.greaterThan(0)
            expect(res.length).to.be.lessThan(30)
            expect(res[0].bookId).to.not.be.null
            expect(res[0].bookTitle).to.not.be.null
        })

        it('should return a maximum of 30 books', async () => {
            const serviceInstance = new AuthorService(CONSTANTS.AUTHOR_ID_WITH_MANY_BOOKS)
            const res = await serviceInstance.getBooks()

            expect(res.length).to.equal(30)
            expect(res[29].bookId).to.not.be.null
            expect(res[29].bookTitle).to.not.be.null
        })

        it('should return cached data', async () => {
            const serviceInstance = new AuthorService(CONSTANTS.AUTHOR_ID_WITH_FEW_BOOKS)
            await serviceInstance.getBooks()
            const res = await serviceInstance.getBooks()

            expect(res.length).to.be.greaterThan(0)
            expect(res.length).to.be.lessThan(30)
            expect(res[0].bookId).to.not.be.null
            expect(res[0].bookTitle).to.not.be.null
        })
    })
})
