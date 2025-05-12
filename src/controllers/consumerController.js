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

module.exports = {
  registerConsumer,
};
