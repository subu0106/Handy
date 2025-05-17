const db = require("../helpers/dbHelper");
const constant = require("../helpers/constants");


// Register Consumer
const registerConsumer = async (req, res) => {
  try {
    const {
      user_id,
      name,
      email,
      user_type,
      phone,
      location,
      avatar,
      created_at,
      penalty_point,
      is_deleted,
      deleted_at
    } = req.body;

    // Set default values
    const defaultUserType = constant.USER_TYPES.CONSUMER;
    const defaultPenaltyPoint = 0;
    const defaultIsDeleted = false;
    const defaultCreatedAt = created_at || new Date().toISOString(); 

    
    // Ensure required fields are present
    if (!user_id || !name || !email) {
      return res.status(400).json({ error: "Missing required fields (user_id, name, email)" });
    }

    const consumer = await db.create(constant.DB_TABLES.USERS,
      {
        user_id,
        name,
        email,
        user_type: user_type || defaultUserType, 
        phone,
        location,
        avatar,
        created_at: defaultCreatedAt, 
        penalty_point: penalty_point === undefined ? defaultPenaltyPoint : penalty_point,
        is_deleted: is_deleted === undefined ? defaultIsDeleted : is_deleted,     
        deleted_at
      }
    );
    res.status(201).json(consumer); 
  } catch (err) {
    console.error("Error registering consumer:", err); 
    res.status(500).json({ error: "Internal server error" });
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
