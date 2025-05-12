const constant = require("../helpers/constants");
const db = require("../helpers/dbHelper");


// Register Consumer
const registerConsumer = async (req, res) => {
  try {
    const data = req.body;
    data.user_type = constant.USER_TYPES.CONSUMER; // force type
    // const consumer = await db.insert("user", data);
    console.log("data", data);
    res.status(constant.HTTP_STATUS.CREATED).json(data);
  } catch (err) {
    res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR);
    throw err;
  }
};

module.exports = {
  registerConsumer,
};
