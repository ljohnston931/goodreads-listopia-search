const chai = require('chai')
const expect = chai.expect
const CONSTANTS = require('./TESTING_CONSTANTS.json')
const db = require('../models/index')
const ListsInCommonService = require('../services/ListsInCommonService')
const _ = require('lodash')
const AuthorService = require('../services/AuthorService')

describe.only('ListsInCommonService', () => {
    describe('#getListsInCommon', () => {
        before(async () => {
            const listPromise = db.lists.create({
                book_id: CONSTANTS.BOOK_ID_WITH_NO_LISTS,
                list_title: 'example_title',
                list_href: 'example_href',
            })
            const authorPromise = db.author_books.create({
                author_id: CONSTANTS.AUTHOR_ID_WITH_NO_BOOKS,
                book_id: CONSTANTS.BOOK_ID_WITH_NO_LISTS,
            })
            await Promise.all([listPromise, authorPromise])
        })
        after(async () => {
            const listPromise = db.lists.destroy({
                where: { book_id: CONSTANTS.BOOK_ID_WITH_NO_LISTS },
            })
            const authorPromise = db.author_books.destroy({
                where: { author_id: CONSTANTS.AUTHOR_ID_WITH_NO_BOOKS },
            })
            await Promise.all([listPromise, authorPromise])
        })
        it('should return list with only book id', async () => {
            const listsInCommonService = new ListsInCommonService(
                [CONSTANTS.BOOK_ID_WITH_NO_LISTS],
                []
            )
            const listsInCommon = await listsInCommonService.getListsInCommon()

            expect(listsInCommon).to.have.length(1)
            expect(listsInCommon[0].title).to.equal('example_title')
        })
        it('should return list with only author id', async () => {
            const listsInCommonService = new ListsInCommonService(
                [],
                [CONSTANTS.AUTHOR_ID_WITH_NO_BOOKS]
            )
            const listsInCommon = await listsInCommonService.getListsInCommon()

            expect(listsInCommon).to.have.length(1)
            expect(listsInCommon[0].title).to.equal('example_title')
        })
        it('should return list with both ids', async () => {
            const listsInCommonService = new ListsInCommonService(
                [CONSTANTS.BOOK_ID_WITH_NO_LISTS],
                [CONSTANTS.AUTHOR_ID_WITH_NO_BOOKS]
            )
            const listsInCommon = await listsInCommonService.getListsInCommon()

            expect(listsInCommon).to.have.length(1)
            expect(listsInCommon[0].title).to.equal('example_title')
        })
    })
})
