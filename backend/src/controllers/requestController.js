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

    res.status(constant.HTTP_STATUS.CREATED).json(request);

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
    res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR);
    throw err;
  }
};


const getRequestById = async (req, res) => {
  try {
    const request_id = req.params.request_id;
    const condition = "WHERE (request_id = $1)";
    const request = await db.getOne(constant.DB_TABLES.REQUESTS, condition, [request_id]);

    if (!request){
      res.status(constant.HTTP_STATUS.NOT_FOUND).json({message: "Request not found"});
    } else {
      res.status(constant.HTTP_STATUS.OK).json(request);
    }
  } catch(err){
    res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR);
    throw err;
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
        res.status(constant.HTTP_STATUS.OK).json(updatedRequest);
      } else {
        res.status(constant.HTTP_STATUS.NOT_FOUND).json({message:"Request Not Found"});
      }

    } catch (error) {
      res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  } else {
    res.status(constant.HTTP_STATUS.BAD_REQUEST).json({message:"Invalid Request Status Provided"});
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
    const deletedRequest = await db.remove(constant.DB_TABLES.REQUESTS, condition, [request_id]);
    if (deletedRequest) {
      res.status(constant.HTTP_STATUS.OK).json({message: "Request deleted successfully"});
    } else {
      res.status(constant.HTTP_STATUS.NOT_FOUND).json({message: "Request Not Found"});
    }
  } catch (error) {
    res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

module.exports = {
  createRequest,
  getRequestById,
  updateRequestStatus,
  getAllActiveRequests,
  deleteRequest
};
