const db = require('../models/index')
const _ = require('lodash')
const AuthorService = require('./AuthorService')

class ListsInCommonService {
    constructor(bookIds, authorIds) {
        this.bookIds = bookIds
        this.authorIds = authorIds
    }

    async getListsInCommon() {
        const [bookLists, authorLists] = await Promise.all([
            this.getBookLists(this.bookIds),
            this.getAuthorLists(this.authorIds),
        ])
        const arraysToCompare = bookLists
            .map(bookList => bookList.lists)
            .concat(authorLists.map(authorList => authorList.lists))
        const listsInCommon = _.intersectionBy(...arraysToCompare, 'href').filter(
            list => list.title && list.href
        )

        return listsInCommon
    }

    async getBookLists() {
        return Promise.all(
            this.bookIds.map(async bookId => {
                let bookLists = await db.lists.findAll({
                    attributes: ['list_title', 'list_href'],
                    where: { book_id: bookId },
                })

                if (!bookLists.length) {
                    throw new Error(`Book lists were not in database. Book ID: ${bookId}`)
                }

                return {
                    bookId,
                    lists: bookLists.map(list => {
                        return { title: list.list_title, href: list.list_href }
                    }),
                }
            })
        )
    }

    async getAuthorLists() {
        return await Promise.all(
            this.authorIds.map(async authorId => {
                const authorService = new AuthorService(authorId)
                const bookIds = await authorService.getBooksByAuthorFromDatabase()
                const bookListsFromDatabase = await db.lists.findAll({
                    attributes: ['book_id', 'list_title', 'list_href'],
                    where: { book_id: bookIds },
                })
                const bookIdsInDatabase = [
                    ...new Set(bookListsFromDatabase.map(list => list.book_id)),
                ]
                if (bookIds.length > bookIdsInDatabase.length) {
                    throw new Error(`Not all books in database. Author ID: ${authorId}`)
                }
                let lists = _.flatten(bookListsFromDatabase)
                lists = lists.map(list => {
                    return { title: list.list_title, href: list.list_href }
                })
                return { authorId: authorId, lists: lists }
            })
        )
    }
}

module.exports = ListsInCommonService
