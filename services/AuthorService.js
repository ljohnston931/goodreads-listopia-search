const http = require('../http')
const convert = require('xml-js')
const _ = require('lodash')
require('dotenv').config()
const db = require('../models/index')

class AuthorService {
    constructor(authorId) {
        this.authorId = authorId
    }

    async getBooks() {
        const authorBooks = await db.author_books.findAll({
            where: { author_id: this.authorId },
        })
    }

    async areAuthorBooksCached() {
        const authorBooks = await db.author_books.findOne({
            where: { author_id: this.authorId },
        })
        return authorBooks !== null
    }

    async getBooksByAuthor(authorId) {
        let bookIds = await this.getBooksByAuthorFromDatabase(authorId)
        if (!bookIds.length) {
            bookIds = await this.getBooksByAuthorFromGoodreads(authorId)
            await db.author_books.bulkCreate(
                bookIds.map(bookId => {
                    return {
                        author_id: authorId,
                        book_id: bookId,
                    }
                })
            )
        }
        return bookIds
    }

    async getBooksByAuthorFromDatabase(authorId) {
        const results = await db.author_books.findAll({
            attributes: ['book_id'],
            where: { author_id: authorId },
        })
        return results.map(results => results.dataValues.book_id)
    }

    async getBooksByAuthorFromGoodreads(authorId) {
        let bookIds = []
        let getAnotherPage = true
        let page = 1

        while (getAnotherPage) {
            const resp = await http.slow.get(`https://www.goodreads.com/author/list.xml`, {
                params: {
                    key: process.env.GOODREADS_API_KEY,
                    id: authorId,
                    page: page,
                },
            })
            const json = convert.xml2json(resp.data, { compact: true, spaces: 2 })
            const results = JSON.parse(json).GoodreadsResponse.author.books
            let books = results.book
            if (!(books instanceof Array)) {
                books = [books]
            }
            bookIds = bookIds.concat(books.map(book => book.id._text))
            getAnotherPage = results._attributes.end !== results._attributes.total
            page++
        }

        return bookIds
    }
}

module.exports = AuthorService

// constructor(authorId)

// areAuthorBooksInDatabase {
//   return boolean
// }

// scrapePage(page){
//   data = getData
//   if page = 1 {
//     data.totalPages = totalPages
//   }
//   return data
// }

// cacheAuthorBooks(books) {
//   store in author books db
//   store in books db
// }
