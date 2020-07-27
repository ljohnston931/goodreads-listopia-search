const http = require('../http')
const cheerio = require('cheerio')
const db = require('../models/index')

class HtmlParser {
    constructor(document) {
        this.$ = cheerio.load(document)
    }

    getListsOnPage() {
        let lists = []
        this.$('.cell').each((listIndex, cell) => {
            const listTitle = this.$(cell).find('.listTitle')
            lists[listIndex] = {
                list_title: listTitle.text(),
                list_href: listTitle.attr('href').split('#')[0],
            }
        })

        return lists
    }

    getTotalPages() {
        const nextPage = this.$('a.next_page')

        if (!nextPage.length) {
            if (this.$('.cell').length) {
                return 1
            }
            return 0
        }

        const lastPage = parseInt(nextPage.prev().text())
        return lastPage
    }
}

class ListSThatIncludeBookService {
    constructor(bookId) {
        this.bookId = bookId
    }

    async areBookListsCached() {
        const bookLists = await db.lists.findOne({
            where: { book_id: this.bookId },
        })
        return bookLists !== null
    }

    async scrapeBookListsPage(page) {
        const resp = await http.medium.get(
            `https://www.goodreads.com/list/book/${this.bookId}?page=${page}`
        )
        const parser = new HtmlParser(resp.data)
        let lists = parser.getListsOnPage()
        let totalPages = null
        if (page == 1) {
            console.log('page', page)
            totalPages = parser.getTotalPages()
        }
        return {
            totalPages: totalPages,
            lists: lists,
        }
    }

    async cacheBookLists(bookLists) {
        if (bookLists.length) {
            await db.lists.bulkCreate(
                bookLists.map(list => {
                    return {
                        book_id: this.bookId,
                        list_title: list.list_title,
                        list_href: list.list_href,
                    }
                })
            )
        } else {
            await db.lists.create({
                book_id: this.bookId,
                list_title: null,
                list_href: null,
            })
        }
    }
}

module.exports = ListSThatIncludeBookService
