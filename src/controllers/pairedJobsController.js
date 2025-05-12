const constant = require("../helpers/constants");
const db = require("../helpers/dbHelper");

const createPairedJob = async (req, res) => {
  try {
    const data = req.body;
    const job = await db.insert("paired_jobs", data);
    res.status(201).json(job);
  } catch (err) {
    res.status(500);
    throw err;
  }
};

module.exports = {
    createPairedJob,
    };
