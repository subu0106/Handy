const constant = require("../helpers/constants");
const db = require("../helpers/dbHelper");

const createPairedJob = async (req, res) => {
  try {
    const {
      consumer_id,
      provider_id,
      request_id,
      offer_id,
      budget,
      timeframe
    } = req.body;

    if (!consumer_id || !provider_id || !request_id || !offer_id) {
      return res.status(constant.HTTP_STATUS.BAD_REQUEST).json({
        message: "consumer_id, provider_id, request_id, and offer_id are required"
      });
    }

    // Get request details to extract title, description, and service_id
    const request = await db.getOne(
      constant.DB_TABLES.REQUESTS,
      "WHERE request_id = $1",
      [request_id]
    );

    if (!request) {
      return res.status(constant.HTTP_STATUS.NOT_FOUND).json({
        message: "Request not found"
      });
    }

    // Get service_id from the request's service field
    let service_id = 1; // Default service ID
    if (request.service_id) {
      service_id = request.service_id;
    } else if (request.service) {
      // If service is stored as name, find the service_id
      const service = await db.getOne(
        constant.DB_TABLES.SERVICES,
        "WHERE service_name = $1",
        [request.service]
      );
      if (service) {
        service_id = service.service_id;
      }
    }

    // Create the paired job with the correct schema
    const jobData = {
      consumer_id,
      provider_id,
      service_id,
      title: request.title,
      description: request.description,
      cost: budget || request.budget
      // rating and review will be null initially
    };

    console.log('Creating paired job with data:', jobData);

    const job = await db.create(constant.DB_TABLES.PAIREDJOBS, jobData);

    if (!job) {
      return res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: "Failed to create paired job"
      });
    }

    // Emit WebSocket notification to provider
    const io = req.app.get("io");
    if (io) {
      const notificationData = {
        job_id: job.job_id,
        consumer_id,
        request_title: request.title,
        budget: budget || request.budget,
        message: `New job assigned: "${request.title}" - LKR ${budget || request.budget}`
      };

      console.log(`Emitting new job assignment to provider: new_job_${provider_id}`, notificationData);
      io.emit(`paired_jobs_${provider_id}`, notificationData);
    }
    
    res.status(constant.HTTP_STATUS.CREATED).json({
      success: true,
      job,
      message: "Paired job created successfully"
    });
  } catch (err) {
    console.error("Error creating paired job:", err);
    res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: "Internal server error",
      details: err.message
    });
  }
};

const getPairedJobs = async (req, res) => {
  const {consumer_id, provider_id} = req.query;
  if (consumer_id && provider_id) {
    try{
      const conditions = `WHERE consumer_id = $1 and provider_id = $2`;
      const paireJobList = await db.getAll(constant.DB_TABLES.PAIREDJOBS, conditions, [consumer_id, provider_id]);
      if (paireJobList && paireJobList.length > 0) {
        res.status(constant.HTTP_STATUS.OK).json(paireJobList);
      } else {
        res.status(constant.HTTP_STATUS.NOT_FOUND).json({message: "No paired jobs found"});
      }    
    } catch(err){
      res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR);
      throw err;
    } 
  } else if (consumer_id) {
    try{
      const conditions = `WHERE consumer_id = $1`;
      const consumerPairedJobList = await db.getAll(constant.DB_TABLES.PAIREDJOBS, conditions, [consumer_id]);
      if (consumerPairedJobList && consumerPairedJobList.length > 0) {
        res.status(constant.HTTP_STATUS.OK).json(consumerPairedJobList);
      } else {
        res.status(constant.HTTP_STATUS.NOT_FOUND).json({message: `No paired jobs found for consumer ID: ${consumer_id}`});
      }    
    } catch(err){
      res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR);
      throw err;
    } 
  } else if (provider_id) {
    try{
      const conditions = `WHERE provider_id = $1`;
      const providerPairedJobList = await db.getAll(constant.DB_TABLES.PAIREDJOBS, conditions, [provider_id]);
      if (providerPairedJobList && providerPairedJobList.length > 0) {
        res.status(constant.HTTP_STATUS.OK).json(providerPairedJobList);
      } else {
        res.status(constant.HTTP_STATUS.NOT_FOUND).json({message: `No paired jobs found for provider ID: ${provider_id}`});
      }    
    } catch(err){
      res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR);
      throw err;
    } 
  } else {
    res.status(constant.HTTP_STATUS.BAD_REQUEST).json({message: "Either consumer_id or provider_id is required"});
  }
};

module.exports = {
    createPairedJob,
    getPairedJobs
};
