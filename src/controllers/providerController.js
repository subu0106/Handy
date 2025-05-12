const constant = require("../helpers/constants");
const db = require("../helpers/dbHelper");

const registerProvider = async (req, res) => {
  try {
    const { name, email, user_type, phone, location, avatar, services_array, availability, average_rating, review_count, bio } = req.body;

    // Step 1: Insert into user table
    const user = await db.create(constant.DB_TABLES.USERS, { name, email, user_type: constant.USER_TYPES.PROVIDERS, phone, location, avatar });

    // Step 2: Insert into providers table using same user_id
    const provider = await db.create(constant.DB_TABLES.PROVIDERS, {
      user_id: user.user_id,
      services_array,
      availability,
      average_rating,
      review_count,
      bio
    });

    res.status(constant.HTTP_STATUS.CREATED).json({ user, provider });
  } catch (err) {
    res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR);
    throw err;
  }
};

module.exports = {
  registerProvider,
};
