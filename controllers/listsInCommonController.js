const ListsInCommonService = require('../services/ListsInCommonService')

exports.getListsInCommon = async (req, res) => {
    let { bookIds, authorIds } = req.body

    if (!bookIds && !authorIds) {
        res.status(400).send('bookIds or authorIds required')
    } else {
        bookIds = bookIds || []
        authorIds = authorIds || []

        try {
            const listsInCommonService = new ListsInCommonService(bookIds, authorIds)
            const listsInCommon = await listsInCommonService.getListsInCommon()
            res.send(listsInCommon)
        } catch (error) {
            console.log(error)
            res.status(500).send(error)
        }
    }
}
