const chai = require('chai')
const expect = chai.expect
const CONSTANTS = require('./TESTING_CONSTANTS.json')
const ListsThatIncludeBookService = require('../services/ListsThatIncludeBookService')
const db = require('../models/index')

describe('ListsThatIncludeBookService', () => {
    describe('#areBooksListsInDatabase', () => {
        afterEach(async () => {
            await db.lists.destroy({
                where: { book_id: CONSTANTS.BOOK_ID_WITH_NO_LISTS },
            })
        })
        it('should return true if book lists are loaded in database', async () => {
            await db.lists.create({
                book_id: CONSTANTS.BOOK_ID_WITH_NO_LISTS,
                list_title: null,
                list_href: null,
            })
            const serviceInstance = new ListsThatIncludeBookService(CONSTANTS.BOOK_ID_WITH_NO_LISTS)
            const res = await serviceInstance.areBookListsInDatabase()
            expect(res).to.be.true
        })
        it('should return false if book lists are not loaded in database', async () => {
            const serviceInstance = new ListsThatIncludeBookService(CONSTANTS.BOOK_ID_WITH_NO_LISTS)
            const res = await serviceInstance.areBookListsInDatabase()
            expect(res).to.be.false
        })
    })

    describe('#scrapeBookListsPage', () => {
        it('should return empty array if no lists on page', async () => {
            const serviceInstance = new ListsThatIncludeBookService(CONSTANTS.BOOK_ID_WITH_NO_LISTS)
            const res = await serviceInstance.scrapeBookListsPage(1)
            expect(res.totalPages).to.equal(0)
            expect(res.lists).to.have.length(0)
        })
        it('should array with data and total pages if first page', async () => {
            const serviceInstance = new ListsThatIncludeBookService(
                CONSTANTS.BOOK_ID_WITH_MANY_LISTS
            )
            const res = await serviceInstance.scrapeBookListsPage(1)
            expect(res.totalPages).to.be.greaterThan(10)
            expect(res.lists).to.have.length(30)
        }).timeout(3000)
        it('should array with data and no total pages if not first page', async () => {
            const serviceInstance = new ListsThatIncludeBookService(
                CONSTANTS.BOOK_ID_WITH_MANY_LISTS
            )
            const res = await serviceInstance.scrapeBookListsPage(5)
            expect(res.lists).to.have.length(30)
        }).timeout(3000)
    })

    describe('#cacheBookLists', () => {
        beforeEach(async () => {
            await db.lists.destroy({
                where: { book_id: CONSTANTS.BOOK_ID_WITH_NO_LISTS },
            })
        })
        afterEach(async () => {
            await db.lists.destroy({
                where: { book_id: CONSTANTS.BOOK_ID_WITH_NO_LISTS },
            })
        })

        it('should add book lists to database', async () => {
            const serviceInstance = new ListsThatIncludeBookService(CONSTANTS.BOOK_ID_WITH_NO_LISTS)
            await serviceInstance.cacheBookLists(CONSTANTS.BOOK_LISTS)

            const bookListsInDatabase = await db.lists.findAll({
                where: { book_id: CONSTANTS.BOOK_ID_WITH_NO_LISTS },
            })

            expect(bookListsInDatabase.length).to.equal(1)
            expect(bookListsInDatabase[0].list_title).to.not.be.null
            expect(bookListsInDatabase[0].list_href).to.not.be.null
        })

        it('should add a null entry to database if empty list', async () => {
            const serviceInstance = new ListsThatIncludeBookService(CONSTANTS.BOOK_ID_WITH_NO_LISTS)
            await serviceInstance.cacheBookLists([])

            const bookListsInDatabase = await db.lists.findAll({
                where: { book_id: CONSTANTS.BOOK_ID_WITH_NO_LISTS },
            })

            expect(bookListsInDatabase.length).to.equal(1)
            expect(bookListsInDatabase[0].list_href).to.be.null
        })
    })
})
