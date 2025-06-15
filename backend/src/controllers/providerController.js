const constant = require('../helpers/constants');
const db = require('../helpers/dbHelper');

const registerProvider = async (req, res) => {
  try {
    const {
      user_id,
      name,
      email,
      user_type,
      phone,
      location,
      avatar,
      services_array,
      availability,
      average_rating,
      review_count,
      bio,
      created_at,
      platform_tokens,
      is_deleted,
      deleted_at,
    } = req.body;

    // Set default values
    const defaultUserType = constant.USER_TYPES.PROVIDER;
    const defaultPenaltyPoint = 0;
    const defaultIsDeleted = false;
    const defaultCreatedAt = created_at || new Date().toISOString();
    const defaultAverageRating = 0;
    const defaultReviewCount = 0;
    const defaultBio = '';

    // Ensure required fields are present
    if (!user_id || !name || !email) {
      return res
        .status(400)
        .json({ error: 'Missing required fields (user_id, name, email)' });
    }

    // Step 1: Insert into user table
    const user = await db.create(constant.DB_TABLES.USERS, {
      user_id,
      name,
      email,
      user_type: user_type || defaultUserType,
      phone,
      location,
      avatar,
      created_at: defaultCreatedAt,
      platform_tokens:
        platform_tokens === undefined ? defaultPenaltyPoint : platform_tokens,
      is_deleted: is_deleted === undefined ? defaultIsDeleted : is_deleted,
      deleted_at,
    });

    // Step 2: Insert into providers table using same user_id
    const provider = await db.create(constant.DB_TABLES.PROVIDERS, {
      user_id: user.user_id,
      services_array,
      availability,
      average_rating: average_rating || defaultAverageRating,
      review_count: review_count || defaultReviewCount,
      bio: bio || defaultBio,
    });

    // Step 3: Update services table to include this provider
    if (services_array) {
      console.log('services_array', services_array);
      const services = await db.getAll(constant.DB_TABLES.SERVICES, '', []);
      console.log('services', services);
      const servicePromises = services_array.map(async (serviceId) => {
        console.log('serviceIddddd', serviceId);
        const service = services.find((s) => s.service_id === serviceId);
        if (service) {
          const providersArr = Array.isArray(service.providers_array)
            ? service.providers_array
            : [];
          if (!providersArr.includes(user.user_id)) {
            providersArr.push(user.user_id);
            await db.update(
              constant.DB_TABLES.SERVICES,
              { providers_array: providersArr },
              'WHERE service_id = $1',
              [serviceId]
            );
          }
        }
      });
      await Promise.all(servicePromises);
    }
    res
      .status(constant.HTTP_STATUS.CREATED)
      .json({ message: 'Provider registered successfully' });
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
  const userUpdatable = ['name', 'phone', 'location', 'avatar',];
  const providerUpdatable = [
    'services_array',
    'availability',
    'average_rating',
    'review_count',
    'bio',
  ];
  userUpdatable.forEach((field) => {
    if (req.body[field] !== undefined) userFields[field] = req.body[field];
  });
  providerUpdatable.forEach((field) => {
    if (req.body[field] !== undefined) providerFields[field] = req.body[field];
  });

  try {
    let updatedUser = true;
    if (Object.keys(userFields).length > 0) {
      updatedUser = await db.update(
        constant.DB_TABLES.USERS,
        userFields,
        'WHERE user_id = $1',
        [user_id]
      );
      if (!updatedUser) {
        return res
          .status(constant.HTTP_STATUS.NOT_FOUND)
          .json({ message: 'User not found' });
      }
    }
    let updatedProvider = true;
    if (Object.keys(providerFields).length > 0) {
      updatedProvider = await db.update(
        constant.DB_TABLES.PROVIDERS,
        providerFields,
        'WHERE user_id = $1',
        [user_id]
      );
      if (!updatedProvider) {
        return res
          .status(constant.HTTP_STATUS.NOT_FOUND)
          .json({ message: 'Provider not found' });
      }
    }
    res
      .status(constant.HTTP_STATUS.OK)
      .json({ message: 'Provider updated successfully' });
  } catch (err) {
    res
      .status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: 'Internal server error' });
  }
};

const updateProviderServices = async (req, res) => {
  const { user_id } = req.params;
  const { services_array } = req.body;

  if (!Array.isArray(services_array)) {
    return res
      .status(constant.HTTP_STATUS.BAD_REQUEST)
      .json({ message: 'services_array must be an array' });
  }

  try {
    // 1. Get current provider's services_array
    const provider = await db.getOne(
      constant.DB_TABLES.PROVIDERS,
      'WHERE user_id = $1',
      [user_id]
    );
    if (!provider) {
      return res
        .status(constant.HTTP_STATUS.NOT_FOUND)
        .json({ message: 'Provider not found' });
    }
    const currentServices = Array.isArray(provider.services_array)
      ? provider.services_array
      : [];

    // 2. Find newly added service IDs
    const newServices = services_array.filter(
      (id) => !currentServices.includes(id)
    );

    // 3. Update provider's services_array
    await db.update(
      constant.DB_TABLES.PROVIDERS,
      { services_array },
      'WHERE user_id = $1',
      [user_id]
    );

    // 4. For each new service, add provider to service's providers_array
    for (const serviceId of newServices) {
      const service = await db.getOne(
        constant.DB_TABLES.SERVICES,
        'WHERE service_id = $1',
        [serviceId]
      );
      if (service) {
        const providersArr = Array.isArray(service.providers_array)
          ? service.providers_array
          : [];
        if (!providersArr.includes(user_id)) {
          providersArr.push(user_id);
          await db.update(
            constant.DB_TABLES.SERVICES,
            { providers_array: providersArr },
            'WHERE service_id = $1',
            [serviceId]
          );
        }
      }
    }

    res
      .status(constant.HTTP_STATUS.OK)
      .json({ message: 'Provider services updated successfully' });
  } catch (err) {
    res
      .status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: 'Internal server error' });
  }
};

const updateAvailabilityProvider = async (req, res) => {
  const provider_id = req.params.provider_id;
  const updateData = { availability: req.body.availability };
  const condition = 'WHERE user_id=$1';
  try {
    const updatedProvider = await db.update(
      (table = constant.DB_TABLES.PROVIDERS),
      (data = updateData),
      (conditions = condition),
      (params = [provider_id])
    );
    if (updatedProvider) {
      res.status(constant.HTTP_STATUS.OK).json(updatedProvider);
    } else {
      res
        .status(constant.HTTP_STATUS.NOT_FOUND)
        .json({ message: 'User Not Found' });
    }
  } catch (error) {
    res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

const softDeleteProvider = async (req, res) => {
  const provider_id = req.params.provider_id;
  try {
    const updatedUser = await db.update(
      constant.DB_TABLES.USERS,
      { is_deleted: true, deleted_at: new Date().toISOString() },
      'WHERE user_id = $1',
      [provider_id] //same as user_id
    );
    if (updatedUser) {
      res
        .status(constant.HTTP_STATUS.OK)
        .json({ message: 'Provider soft deleted successfully' });
    } else {
      res
        .status(constant.HTTP_STATUS.NOT_FOUND)
        .json({ message: 'User Not Found' });
    }
  } catch (err) {
    res
      .status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal server error' });
  }
};

const hardDeleteProvider = async (req, res) => {
  const provider_id = req.params.provider_id;
  try {
    // Delete from providers table first (to avoid FK constraint issues)
    const deletedProvider = await db.remove(
      constant.DB_TABLES.PROVIDERS,
      'WHERE user_id = $1',
      [provider_id]
    );

    // Delete from users table
    const deletedUser = await db.remove(
      constant.DB_TABLES.USERS,
      'WHERE user_id = $1',
      [provider_id]
    );

    if (deletedProvider && deletedUser) {
      // Remove provider_id from all services' providers_array
      const services = await db.getAll(constant.DB_TABLES.SERVICES, '', []);
      const servicePromises = services.map(async (service) => {
        if (
          Array.isArray(service.providers_array) &&
          service.providers_array.includes(provider_id)
        ) {
          const updatedProvidersArray = service.providers_array.filter(
            (id) => id !== provider_id
          );
          await db.update(
            constant.DB_TABLES.SERVICES,
            { providers_array: updatedProvidersArray },
            'WHERE service_id = $1',
            [service.service_id]
          );
        }
      });
      await Promise.all(servicePromises);

      res
        .status(constant.HTTP_STATUS.OK)
        .json({ message: 'Provider hard deleted successfully' });
    } else {
      res
        .status(constant.HTTP_STATUS.NOT_FOUND)
        .json({ message: 'User Not Found' });
    }
  } catch (err) {
    res
      .status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal server error' });
  }
};

const updateProviderRatingAndCount = async (req, res) => {
  const provider_id = req.params.provider_id;
  const providedRating = req.query.rating;
  const condition = 'WHERE user_id=$1';

  try {
    const provider = await db.getOne(
      (table = constant.DB_TABLES.PROVIDERS),
      (conditions = condition),
      (params = [provider_id])
    );
    if (!provider) {
      res
        .status(constant.HTTP_STATUS.NOT_FOUND)
        .json({ message: 'User Not Found' });
    } else {
      const averageRating = provider.average_rating;
      const reviewCount = provider.review_count;
      const newTotalRating = averageRating * reviewCount + providedRating;
      const newReviewCount = reviewCount + 1;
      const newAverageRating = newTotalRating / newReviewCount;

      const data = {
        average_rating: newAverageRating,
        review_count: newReviewCount,
      };
      const condition = 'WHERE user_id=$1';
      const updatedProvider = await db.update(
        (table = constant.DB_TABLES.PROVIDERS),
        (data = data),
        (conditions = condition),
        (params = [provider_id])
      );

      if (updatedProvider) {
        res.status(constant.HTTP_STATUS.OK).json(updatedProvider);
      } else {
        res
          .status(constant.HTTP_STATUS.NOT_FOUND)
          .json({ message: 'Provider Not Found' });
      }
    }
  } catch (err) {
    res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

module.exports = {
  registerProvider,
  updateProvider,
  updateAvailabilityProvider,
  updateProviderRatingAndCount,
  updateProviderServices,
  softDeleteProvider,
  hardDeleteProvider,
};
