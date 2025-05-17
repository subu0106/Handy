const constant = require("../helpers/constants");
const db = require("../helpers/dbHelper");

const registerProvider = async (req, res) => {
  try {
    const { name, email, user_type, phone, location, avatar, services_array, availability, average_rating, review_count, bio } = req.body;

    // Set default values
    const defaultUserType = constant.USER_TYPES.CONSUMER;
    const defaultPenaltyPoint = 0;
    const defaultIsDeleted = false;
    const defaultCreatedAt = created_at || new Date().toISOString(); 
    const defaultAverageRating = 0;
    const defaultReviewCount = 0;
    const defaultBio = '';

     // Ensure required fields are present
    if (!user_id || !name || !email) {
      return res.status(400).json({ error: "Missing required fields (user_id, name, email)" });
    }

    // Step 1: Insert into user table
    const user = await db.create(constant.DB_TABLES.USERS,
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

    // Step 2: Insert into providers table using same user_id
    const provider = await db.create(constant.DB_TABLES.PROVIDERS, {
      user_id: user.user_id,
      services_array,
      availability,
      average_rating: average_rating || defaultAverageRating,
      review_count: review_count || defaultReviewCount,
      bio: bio || defaultBio
    });


    // Step 3: Update services table to include this provider
    const services = await db.getAll(constant.DB_TABLES.SERVICES, '', []);
    const servicePromises = services.map(async (service) => {
      if (service.service_id === services_array) {
        const updatedProvidersArray = [...service.providers_array, user.user_id];
        await db.update(constant.DB_TABLES.SERVICES, { providers_array: updatedProvidersArray }, 'WHERE service_id = $1', [service.service_id]);
      }
    });
    await Promise.all(servicePromises);
    
  } catch (err) {
    res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR);
    throw err;
  }
};

const updateProvider = async (req, res) => {
  const { user_id } = req.params;
  const userFields = {};
  const providerFields = {};
  // Only add fields if they are present in req.body
  const userUpdatable = ["name", "phone", "location", "avatar"];
  const providerUpdatable = ["services_array", "availability", "average_rating", "review_count", "bio"];
  userUpdatable.forEach(field => {
    if (req.body[field] !== undefined) userFields[field] = req.body[field];
  });
  providerUpdatable.forEach(field => {
    if (req.body[field] !== undefined) providerFields[field] = req.body[field];
  });

  try {
    let updatedUser = true;
    if (Object.keys(userFields).length > 0) {
      updatedUser = await db.update(constant.DB_TABLES.USERS, userFields, 'WHERE user_id = $1', [user_id]);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
    }
    let updatedProvider = true;
    if (Object.keys(providerFields).length > 0) {
      updatedProvider = await db.update(constant.DB_TABLES.PROVIDERS, providerFields, 'WHERE user_id = $1', [user_id]);
      if (!updatedProvider) {
        return res.status(404).json({ message: "Provider not found" });
      }
    }
    res.status(200).json({ message: "Provider updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
}

const updateAvailabilityProvider = async (req, res) => {
  const provider_id = req.params.provider_id;
  const updateData = {"availability": req.body.availability};
  const condition = 'WHERE user_id=$1';
  try {
    const updatedProvider = await db.update(table=constant.DB_TABLES.PROVIDERS, data=updateData, conditions=condition, params=[provider_id]);
    if (updatedProvider) {
      res.status(constant.HTTP_STATUS.OK).json(updatedProvider);
    } else {
      res.status(constant.HTTP_STATUS.NOT_FOUND).json({message: "User Not Found"});
    }
  } catch (error) {
    res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

module.exports = {
  registerProvider,
  updateProvider,
  updateAvailabilityProvider
};
