const constant = require("../helpers/constants");
const db = require("../helpers/dbHelper");


const createRequest = async (req, res) => {
  try {
    const data = req.body;
    data.status = constant.REQUESTS_STATUS.PENDING;
    data.created_at = new Date().toISOString();

    if (data.image_urls && Array.isArray(data.image_urls)) {
      data.image_urls = data.image_urls.filter(url => url && url.trim());
      if (data.image_urls.length === 0) {
        data.image_urls = null;
      }
    } else if (data.image_url) {
      data.image_urls = [data.image_url];
      delete data.image_url;
    } else {
      data.image_urls = null;
    }

    if (!data.user_id) {
      return res.status(constant.HTTP_STATUS.BAD_REQUEST).json({message: "consumer_id is required"});
    }

    const consumer = await db.getOne(
      constant.DB_TABLES.USERS, 
      "WHERE user_id = $1", 
      [data.user_id]
    );

    if (!consumer) {
      return res.status(constant.HTTP_STATUS.NOT_FOUND).json({message: "Consumer not found"});
    }

    if (consumer.platform_tokens < 1) {
      return res.status(constant.HTTP_STATUS.BAD_REQUEST).json({
        message: "Insufficient platform tokens. You need at least 1 token to create a request."
      });
    }

    console.log("Creating request with data:", data);

    const request = await db.create(constant.DB_TABLES.REQUESTS, data);

    if (!request) {
      return res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message: "Failed to create request"});
    }

    
    if (request.image_urls && request.image_urls.length > 0) {
      request.image_url = request.image_urls[0]; // First image for backward compatibility
    }

    // Deduct 1 platform token from consumer
    const updatedTokens = consumer.platform_tokens - 1;
    await db.update(
      constant.DB_TABLES.USERS,
      { platform_tokens: updatedTokens },
      'WHERE user_id = $1',
      [data.user_id]
    );

    const serviceId = data.service_id;
    const service = await db.getOne(constant.DB_TABLES.SERVICES, "WHERE service_id = $1", [serviceId]);
    if (!service) {
      return res.status(constant.HTTP_STATUS.BAD_REQUEST).json({message: "Invalid service_id provided"});
    }
    const serviceName = service.name;
    
    // Emit event to all clients
    const io = req.app.get("io");
    if (io) {
      io.emit(`new_request_${serviceName}`, {
        title: data.title,
        budget: data.budget,
        request: request,
        image_urls: request.image_urls || null
      });
    }

    return res.status(constant.HTTP_STATUS.CREATED).json({
      ...request,
      platform_tokens: updatedTokens
    });

  } catch (err) {
    console.error("Error creating request:", err);
    return res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error"
    });
  }
};

const getRequestById = async (req, res) => {
  try {
    const request_id = req.params.request_id;
    const condition = "WHERE request_id = $1";
    const request = await db.getOne(constant.DB_TABLES.REQUESTS, condition, [request_id]);
    
    if (!request) {
      return res.status(constant.HTTP_STATUS.NOT_FOUND).json({
        message: "Request not found"
      });
    }
    
    res.status(constant.HTTP_STATUS.OK).json(request);
  } catch (err) {
    // console.error('Error fetching request:', err);
    res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error"
    });
  }
};

const updateRequestStatus = async (req, res) => {
  const request_id = req.params.request_id;
  const newStatus = req.body.status;
  const validRequestStatusArray = [constant.REQUESTS_STATUS.PENDING, constant.REQUESTS_STATUS.ASSIGNED, constant.REQUESTS_STATUS.CLOSED];
  const condition = 'WHERE request_id=$1';

  if (validRequestStatusArray.includes(newStatus)) {
    try {
      const updateData = {"status": newStatus};
      const updatedRequest = await db.update(
        constant.DB_TABLES.REQUESTS, 
        updateData, 
        condition, 
        [request_id]
      );
      if (updatedRequest){
         return res.status(constant.HTTP_STATUS.OK).json(updatedRequest);
      }
      return res.status(constant.HTTP_STATUS.NOT_FOUND).json({message:"Request Not Found"});

    } catch (error) {
      // console.error("Error updating request status:", error);
      return res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: "Internal server error"
      });
    }
  }
  return res.status(constant.HTTP_STATUS.BAD_REQUEST).json({message:"Invalid Request Status Provided"});
}

const getAllActiveRequestsForProvider = async (req, res) => {
  const provider_id = req.params.provider_id;
  try {
    const provider = await db.getOne(constant.DB_TABLES.PROVIDERS, "WHERE user_id=$1", [provider_id]);

    if (!provider) {
      return res.status(constant.HTTP_STATUS.NOT_FOUND).json({message: "Provider not found"});
    }

    const serviceList = provider.services_array;
    const request_consdition = 'WHERE status=$1 AND service_id=ANY($2)';

    const activeRequests = await db.getAll(table=constant.DB_TABLES.REQUESTS, conditions=request_consdition, 
      params=[constant.REQUESTS_STATUS.PENDING, serviceList]);

    if (!activeRequests || activeRequests.length === 0) {
      return res.status(constant.HTTP_STATUS.NOT_FOUND).json({message:"No Active Requests Found"});
    }
    return res.status(constant.HTTP_STATUS.OK).json(activeRequests);

  } catch (err) {
    return res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

const getAllActiveRequestsForConsumer = async (req, res) => {
  const consumer_id = req.params.consumer_id;
  try {
    const request_condition = 'WHERE user_id=$1 AND status=$2';

    const activeRequests = await db.getAll(table=constant.DB_TABLES.REQUESTS, conditions=request_condition, 
      params=[consumer_id, constant.REQUESTS_STATUS.PENDING]);

    if (!activeRequests || activeRequests.length === 0) {
      return res.status(constant.HTTP_STATUS.NOT_FOUND).json({message:"No Active Requests Found"});
    }
    return res.status(constant.HTTP_STATUS.OK).json(activeRequests);

  } catch (err) {
    return res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

const getAllActiveRequests = async (req, res) => {
  try {
    const condition = 'WHERE status=$1';
    const activeRequests = await db.getAll(table=constant.DB_TABLES.REQUESTS, conditions=condition, params=[constant.REQUESTS_STATUS.PENDING]);
    if (activeRequests) {
      res.status(constant.HTTP_STATUS.OK).json(activeRequests);
    } else {
      res.status(constant.HTTP_STATUS.NOT_FOUND).json({message:"No Active Requests Found"});
    }
  } catch (err) {
    res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

const deleteRequest = async (req, res) => {
  const request_id = req.params.request_id;
  const condition = 'WHERE request_id=$1';
  
  try {
    // First, get the request details to find the consumer
    const request = await db.getOne(
      constant.DB_TABLES.REQUESTS,
      condition,
      [request_id]
    );

    if (!request) {
      return res.status(constant.HTTP_STATUS.NOT_FOUND).json({message: "Request Not Found"});
    }

    // Get io instance for emitting events
    const io = req.app.get("io");

    // Check if there are any offers for this request
    const existingOffers = await db.getAll(
      constant.DB_TABLES.OFFERS,
      "WHERE request_id = $1",
      [request_id]
    );

    let updatedTokens = null;
    let refundedProviders = [];

    if (!existingOffers || existingOffers.length === 0) {
      // No offers: refund consumer
      const consumer = await db.getOne(
        constant.DB_TABLES.USERS,
        "WHERE user_id = $1",
        [request.user_id]
      );

      if (consumer) {
        updatedTokens = consumer.platform_tokens + 1;
        await db.update(
          constant.DB_TABLES.USERS,
          { platform_tokens: updatedTokens },
          'WHERE user_id = $1',
          [request.user_id]
        );
      }
    } else {
      // Refund all providers who submitted offers
      for (const offer of existingOffers) {
        const provider = await db.getOne(
          constant.DB_TABLES.USERS,
          "WHERE user_id = $1",
          [offer.provider_id]
        );
        if (provider) {
          const newTokens = provider.platform_tokens + 1;
          await db.update(
            constant.DB_TABLES.USERS,
            { platform_tokens: newTokens },
            'WHERE user_id = $1',
            [offer.provider_id]
          );
          refundedProviders.push({ provider_id: offer.provider_id, platform_tokens: newTokens });

          // Emit refund event to provider
          if (io) {
            io.emit(`offer_declined_${offer.provider_id}`, {
              message: `Your offer for "${request.title}" was declined and your platform token refunded.`,
              platform_tokens: newTokens,
              request_id: request_id,
            });
          }
        }
      }
      // Delete all offers associated with this request
      await db.remove(
        constant.DB_TABLES.OFFERS,
        "WHERE request_id = $1",
        [request_id]
      );
    }

    // Delete the request
    const deletedRequest = await db.remove(constant.DB_TABLES.REQUESTS, condition, [request_id]);
    
    if (deletedRequest) {
      const response = {
        message: "Request deleted successfully",
      };

      if (updatedTokens !== null) {
        response.platform_tokens = updatedTokens;
        response.refund_given = true;
        response.refunded_providers = [];
      } else {
        response.refund_given = false;
        response.refunded_providers = refundedProviders;
        if (refundedProviders.length === 0) {
          response.reason = "No refund given - no providers found for offers";
        }
      }

      return res.status(constant.HTTP_STATUS.OK).json(response);
    }
    
    return res.status(constant.HTTP_STATUS.NOT_FOUND).json({message: "Request Not Found"});
  } catch (error) {
    console.error("Error deleting request:", error);
    return res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error"
    });
  }
}

// ✅ Update enrichRequestsWithUserInfo function
const enrichRequestsWithUserInfo = async (requests) => {
  return await Promise.all(
    requests.map(async (request) => {
      try {
        // Get user details for the request creator
        const user = await db.getOne(
          constant.DB_TABLES.USERS,
          "WHERE user_id = $1",
          [request.user_id]
        );
        
        // ✅ PostgreSQL arrays come as arrays - no parsing needed!
        const imageUrls = request.image_urls || null;
        
        return {
          ...request,
          customer_name: user?.name || "Unknown Customer",
          image_urls: imageUrls,
          // Keep single image_url for backward compatibility (first image)
          image_url: imageUrls && imageUrls.length > 0 ? imageUrls[0] : null
        };
      } catch (error) {
        console.error("Error enriching request with user data:", error);
        return {
          ...request,
          customer_name: "Unknown Customer",
          image_urls: null,
          image_url: null
        };
      }
    })
  );
};

module.exports = {
  createRequest,
  getRequestById,
  updateRequestStatus,
  getAllActiveRequests,
  getAllActiveRequestsForProvider,
  getAllActiveRequestsForConsumer,
  deleteRequest,
  enrichRequestsWithUserInfo
};
