const constant = require("../helpers/constants");
const db = require("../helpers/dbHelper");
const { broadcastToAllProviders } = require("../helpers/sendFCMToProviders");


const createRequest = async (req, res) => {
  try {
    const data = req.body;
    data.status = constant.REQUESTS_STATUS.PENDING;
    data.created_at = new Date().toISOString();

    // Check if required fields are present
    if (!data.user_id) {
      return res.status(constant.HTTP_STATUS.BAD_REQUEST).json({message: "consumer_id is required"});
    }

    const request = await db.create(constant.DB_TABLES.REQUESTS, data);

    if (!request) {
      return res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message: "Failed to create request"});
    }

    return res.status(constant.HTTP_STATUS.CREATED).json(request);

    const payload = {
      title: `New Request Received : ${data.title || `from ${data.user_id}`}`,
      body: `New request with budget ${data.budget}`,
      data: {
        requestId: String(request.request_id),
        serviceId: String(data.service_id),
        title: data.title || "",
        description: data.description || "",
        budget:String(data.budget)
      }
    };
    
    broadcastToAllProviders(payload);
    console.log("Broadcast sent to all providers");

  } catch (err) {
    return res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

const getRequestById = async (req, res) => {
  try {
    const request_id = req.params.request_id;
    const condition = "WHERE (request_id = $1)";
    const request = await db.getOne(constant.DB_TABLES.REQUESTS, condition, [request_id]);

    if (!request){
      return res.status(constant.HTTP_STATUS.NOT_FOUND).json({message: "Request not found"});
    }
    return res.status(constant.HTTP_STATUS.OK).json(request);
  } catch(err){
    return res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

const updateRequestStatus = async (req, res) => {
  const request_id = req.params.request_id;
  const newStatus = req.body.status;
  const validRequestStatusArray = [constant.REQUESTS_STATUS.PENDING, constant.REQUESTS_STATUS.ASSIGNED, , constant.REQUESTS_STATUS.CLOSED];
  const condition = 'WHERE request_id=$1';

  if (validRequestStatusArray.includes(newStatus)) {
    try {
      const updateData = {"status": newStatus};
      const updatedRequest = await db.update(table=constant.DB_TABLES.REQUESTS, data=updateData, conditions=condition, params=[request_id]);
      if (updatedRequest){
         return res.status(constant.HTTP_STATUS.OK).json(updatedRequest);
      }
      return res.status(constant.HTTP_STATUS.NOT_FOUND).json({message:"Request Not Found"});

    } catch (error) {
      return res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR);
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

const deleteRequest = async (req, res) => {
  const request_id = req.params.request_id;
  const condition = 'WHERE request_id=$1';
  try {
    const deletedRequest = await db.remove(constant.DB_TABLES.REQUESTS, condition, [request_id]);
    if (deletedRequest) {
      return res.status(constant.HTTP_STATUS.OK).json({message: "Request deleted successfully"});
    }
    return res.status(constant.HTTP_STATUS.NOT_FOUND).json({message: "Request Not Found"});
  } catch (error) {
    return res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

module.exports = {
  createRequest,
  getRequestById,
  updateRequestStatus,
  getAllActiveRequestsForProvider,
  getAllActiveRequestsForConsumer,
  deleteRequest
};
