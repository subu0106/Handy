const constant = require("../helpers/constants");
const db = require("../helpers/dbHelper");

const createPairedJob = async (req, res) => {
  try {
    const data = req.body;
    const job = await db.insert("paired_jobs", data);
    res.status(201).json(job);
  } catch (err) {
    res.status(500);
    throw err;
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
}

module.exports = {
    createPairedJob,
    getPairedJobs
};
