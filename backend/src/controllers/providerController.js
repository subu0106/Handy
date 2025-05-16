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

module.exports = {
  registerProvider,
};
