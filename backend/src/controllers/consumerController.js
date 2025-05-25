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

const updateConsumer = async (req, res) => {
  const consumer_id = req.params.consumer_id;
  const userFields = {};
  const userUpdatableFields = ["name", "phone", "location", "avatar"];
  try {
    userUpdatableFields.forEach((field) => {
      if (req.body[field]) {
        userFields[field] = req.body[field];
      }
    });
    const updatedUser = await db.update(table=constant.DB_TABLES.USERS, data=userFields, conditions='WHERE user_id = $1', params=[consumer_id]);
    if (updatedUser) {
      res.status(constant.HTTP_STATUS.OK).json(updatedUser);
    } else {
      res.status(constant.HTTP_STATUS.NOT_FOUND).json({message: "User Not Found"});
    }   
  } catch (err) {
    res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

const softDeleteConsumer = async (req, res) => {
  const consumer_id = req.params.consumer_id;
  try {
    const updatedUser = await db.update(
      constant.DB_TABLES.USERS,
      { is_deleted: true, deleted_at: new Date().toISOString() },
      'WHERE user_id = $1',
      [consumer_id]//same as user_id
    );
    if (updatedUser) {
      res.status(constant.HTTP_STATUS.OK).json({ message: "Consumer soft deleted successfully" });
    } else {
      res.status(constant.HTTP_STATUS.NOT_FOUND).json({ message: "User Not Found" });
    }
  } catch (err) {
    res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
  }
};

const hardDeleteConsumer = async (req, res) => {
  const consumer_id = req.params.consumer_id;
  try {
    const deletedUser = await db.remove(
      constant.DB_TABLES.USERS,
      'WHERE user_id = $1',
      [consumer_id]//same as user_id
    );
    if (deletedUser) {
      res.status(constant.HTTP_STATUS.OK).json({ message: "Consumer hard deleted successfully" });
    } else {
      res.status(constant.HTTP_STATUS.NOT_FOUND).json({ message: "User Not Found" });
    }
  } catch (err) {
    res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
  }
};

module.exports = {
  registerConsumer,
  updateConsumer,
  softDeleteConsumer,
  hardDeleteConsumer
};
