// const constant = require("../helpers/constants");
// const db = require("../helpers/dbHelper");


// Register Consumer
const registerConsumer = async (req, res) => {
  try {
    const data = req.body;
    data.user_type = "consumer"; // force type
    // const consumer = await db.create("user", data);
    console.log("data", data);
    res.status(201).json(data);
  } catch (err) {
    res.status(500);
    throw err;
  }
};

const updateConsumer = async(req, res) => {
  const consumer_id = req.params.consumer_id;
  const userFileds = {};
  const userUpdatableFields = ["name", "phone", "location", "avatar"];
  try {

  } catch (err) {

  }
}

module.exports = {
  registerConsumer,
  updateConsumer
};
