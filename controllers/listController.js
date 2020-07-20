const ListService = require("../services/ListService");
const ListServiceInstance = new ListService();

exports.getListsInCommon = async (req, res) => {
  let { bookIds, authorIds } = req.body;

  if (!bookIds && !authorIds) {
    res.status(400).send("bookIds or authorIds required");
  }

  bookIds = bookIds || [];
  authorIds = authorIds || [];

  try {
    const listsInCommon = await ListServiceInstance.getListsInCommon(
      bookIds,
      authorIds
    );
    res.send(listsInCommon);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};
