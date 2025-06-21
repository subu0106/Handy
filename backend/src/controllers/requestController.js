const constant = require("../helpers/constants");
const db = require("../helpers/dbHelper");


const createRequest = async (req, res) => {
  try {
    const data = req.body;
    data.status = constant.REQUESTS_STATUS.PENDING;
    data.created_at = new Date().toISOString();

    // Check if required fields are present
    if (!data.user_id) {
      return res.status(constant.HTTP_STATUS.BAD_REQUEST).json({message: "consumer_id is required"});
    }

    // Check if consumer has enough platform tokens
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

    const request = await db.create(constant.DB_TABLES.REQUESTS, data);

    if (!request) {
      return res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message: "Failed to create request"});
    }

    // Deduct 1 platform token from consumer
    const updatedTokens = consumer.platform_tokens - 1;
    await db.update(
      constant.DB_TABLES.USERS,
      { platform_tokens: updatedTokens },
      'WHERE user_id = $1',
      [data.user_id]
    );

    const serviceId = data.service_id
    const service = await db.getOne(constant.DB_TABLES.SERVICES, "WHERE service_id = $1", [serviceId]);
    if (!service) {
      return res.status(constant.HTTP_STATUS.BAD_REQUEST).json({message: "Invalid service_id provided"});
    }
    const serviceName = service.name;
    // Emit event to all clients
    const io = req.app.get("io");
    io.emit(`new_request_${serviceName}`, {
      title: data.title,
      budget: data.budget,
      request: request
    });

    return res.status(constant.HTTP_STATUS.CREATED).json({
      ...request,
      platform_tokens: updatedTokens
    });

  } catch (err) {
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

    // Check if there are any offers for this request
    const existingOffers = await db.getAll(
      constant.DB_TABLES.OFFERS,
      "WHERE request_id = $1",
      [request_id]
    );

    let updatedTokens = null;

    // Only refund platform token if there are no offers
    if (!existingOffers || existingOffers.length === 0) {
      // Get consumer details to refund the platform token
      const consumer = await db.getOne(
        constant.DB_TABLES.USERS,
        "WHERE user_id = $1",
        [request.user_id]
      );

      if (consumer) {
        // Refund 1 platform token to consumer
        updatedTokens = consumer.platform_tokens + 1;
        await db.update(
          constant.DB_TABLES.USERS,
          { platform_tokens: updatedTokens },
          'WHERE user_id = $1',
          [request.user_id]
        );
      }
    }

    // Delete all offers associated with this request (if any)
    if (existingOffers && existingOffers.length > 0) {
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

      // Only include platform_tokens in response if refund was given
      if (updatedTokens !== null) {
        response.platform_tokens = updatedTokens;
        response.refund_given = true;
      } else {
        response.refund_given = false;
        response.reason = "No refund given - offers exist for this request";
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

module.exports = {
  createRequest,
  getRequestById,
  updateRequestStatus,
  getAllActiveRequests,
  getAllActiveRequestsForProvider,
  getAllActiveRequestsForConsumer,
  deleteRequest
};
