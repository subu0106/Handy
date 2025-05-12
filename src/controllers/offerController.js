const constant = require("../helpers/constants");
const db = require("../helpers/dbHelper");

const createOffers = async (req, res) => {
  try {
    const data = req.body;
    data.status = "PENDING";
    data.created_at = new Date();

    const offer = await db.insert("offers", data);
    res.status(constant.HTTP_STATUS.CREATED).json(offer);
  } catch (err) {
    res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR);
    throw err;
  }
};

module.exports = {
    createOffers,
    };
