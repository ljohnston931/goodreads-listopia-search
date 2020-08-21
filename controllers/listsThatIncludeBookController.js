const ListsThatIncludeBookService = require('../services/ListsThatIncludeBookService')

exports.areBookListsCached = async (req, res) => {
    if (!req.params.bookId) {
        res.sendStatus(400)
    } else {
        try {
            const serviceInstance = new ListsThatIncludeBookService(req.params.bookId)
            const inCache = await serviceInstance.areBookListsCached()
            res.send(inCache)
        } catch (error) {
            console.log(error)
            res.status(500).send(error)
        }
    }
}

exports.scrapeBookListsPage = async (req, res) => {
    if (!req.params.bookId || !req.params.page) {
        res.sendStatus(400)
    } else {
        try {
            const serviceInstance = new ListsThatIncludeBookService(req.params.bookId)
            const pageData = await serviceInstance.scrapeBookListsPage(req.params.page)
            res.send(pageData)
        } catch (error) {
            console.log(error)
            res.status(500).send(error)
        }
    }
}

exports.cacheBookLists = async (req, res) => {
    if (!req.params.bookId || !req.body.bookLists) {
        res.sendStatus(400)
    } else {
        try {
            const serviceInstance = new ListsThatIncludeBookService(req.params.bookId)
            await serviceInstance.cacheBookLists(req.body.bookLists)
            res.sendStatus(200)
        } catch (error) {
            console.log(error)
            res.status(500).send(error)
        }
    }
}
