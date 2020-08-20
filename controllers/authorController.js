const AuthorService = require('../services/AuthorService')

exports.getBooks = async (req, res) => {
    if (!req.params.authorId) {
        res.status(400).send("Parameter 'authorId' is missing")
    } else {
        try {
            const authorService = new AuthorService(req.params.authorId)
            const results = await authorService.getBooks()
            res.send(results)
        } catch (error) {
            console.log(error)
            res.status(500).send(error)
        }
    }
}
