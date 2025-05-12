const constant = require("../helpers/constants");
const db = require("../helpers/dbHelper");

const createRequest = async (req, res) => {
  try {
    const data = req.body;
    data.status = "PENDING";
    data.created_at = new Date();

    const request = await db.create("requests", data);
    res.status(201).json(request);
  } catch (err) {
    res.status(500);
    throw err;
  }
};

module.exports = {
  createRequest,
};
