const BookService = require('../services/BookService')
const BookServiceInstance = new BookService()

exports.search = async (req, res) => {
    if (!req.query || !req.query.q) {
        res.status(400).send("Parameter 'q' is missing")
    } else {
        try {
            const results = await BookServiceInstance.search(req.query.q)
            res.send(results)
        } catch (error) {
            console.log(error)
            res.status(500).send(error)
        }
    }
}

exports.getGoodreadsBooks = async (req, res) => {
    if (!req.body || !req.body.isbns) {
        res.status(400).send("Missing parameter 'isbns'")
    } else {
        try {
            const goodreadsBooks = await BookServiceInstance.getGoodreadsBooks(req.body.isbns)
            res.send(goodreadsBooks)
        } catch (error) {
            console.log(error)
            if (error.status) {
                res.status(error.status).send(error.message)
            } else {
                res.status(500).send(error)
            }
        }
    }
}
