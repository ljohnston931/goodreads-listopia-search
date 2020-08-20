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
        const bookIds = await this.getBooksByAuthorFromDatabase()

        let books

        if (bookIds.length) {
            books = await this.getBooksFromDatabase(bookIds)
        } else {
            books = await this.cacheBooksFromGoodreads()
        }

        return books.map(book => {
            return {
                title: book.title,
                bookId: book.book_id,
            }
        })
    }

    async cacheBooksFromGoodreads() {
        const resp = await http.slow.get(`https://www.goodreads.com/author/list.xml`, {
            params: {
                key: process.env.GOODREADS_API_KEY,
                id: this.authorId,
                page: 1,
            },
        })
        const json = convert.xml2json(resp.data, { compact: true, spaces: 2 })
        const res = JSON.parse(json).GoodreadsResponse
        const results = JSON.parse(json).GoodreadsResponse.author.books
        let books = res.author.books.book
        if (!(books instanceof Array)) {
            books = [books]
        }
        const authorName = res.author.name._text
        const booksForDatabase = books.map(book => {
            return {
                book_id: book.id._text,
                title: book.title._text,
                author_id: this.authorId,
                author_name: authorName,
            }
        })
        const authorBooksForDatabase = books.map(book => {
            return {
                author_id: this.authorId,
                book_id: book.id._text,
            }
        })
        await db.books.bulkCreate(booksForDatabase, {
            ignoreDuplicates: true,
        })
        await db.author_books.bulkCreate(authorBooksForDatabase)

        return booksForDatabase
    }

    // async getBooksByAuthor(authorId) {
    //     let bookIds = await this.getBooksByAuthorFromDatabase(authorId)
    //     if (!bookIds.length) {
    //         bookIds = await this.getBooksByAuthorFromGoodreads(authorId)
    //         await db.author_books.bulkCreate(
    //             bookIds.map(bookId => {
    //                 return {
    //                     author_id: authorId,
    //                     book_id: bookId,
    //                 }
    //             })
    //         )
    //     }
    //     return bookIds
    // }

    async getBooksFromDatabase(bookIds) {
        const results = await db.books.findAll({
            attributes: ['book_id', 'title'],
            where: { book_id: bookIds },
        })
        return results.map(result => result.dataValues)
    }

    async getBooksByAuthorFromDatabase() {
        const results = await db.author_books.findAll({
            attributes: ['book_id'],
            where: { author_id: this.authorId },
        })
        return results.map(result => result.dataValues.book_id)
    }

    // async getBooksByAuthorFromGoodreads(authorId) {
    //     let bookIds = []
    //     let getAnotherPage = true
    //     let page = 1

    //     while (getAnotherPage) {
    //         const resp = await http.slow.get(`https://www.goodreads.com/author/list.xml`, {
    //             params: {
    //                 key: process.env.GOODREADS_API_KEY,
    //                 id: authorId,
    //                 page: page,
    //             },
    //         })
    //         const json = convert.xml2json(resp.data, { compact: true, spaces: 2 })
    //         const results = JSON.parse(json).GoodreadsResponse.author.books
    //         let books = results.book
    //         if (!(books instanceof Array)) {
    //             books = [books]
    //         }
    //         bookIds = bookIds.concat(books.map(book => book.id._text))
    //         getAnotherPage = results._attributes.end !== results._attributes.total
    //         page++
    //     }

    //     return bookIds
    // }
}

module.exports = AuthorService
