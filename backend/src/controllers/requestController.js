const constant = require("../helpers/constants");
const db = require("../helpers/dbHelper");

const createRequest = async (req, res) => {
  try {
    const data = req.body;
    data.status = "PENDING";
    data.created_at = new Date();

    const request = await db.create("requests", data);
    res.status(constant.HTTP_STATUS.CREATED).json(request);
  } catch (err) {
    res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR);
    throw err;
  }
};
const getRequestById = async (req, res) => {
  try {
    const request_id = req.params.request_id;
    // console.log(request_id);
    const condition = "WHERE (request_id = $1)";
    const request = await db.getOne('public.requests', condition, [request_id]);
    // const request = await db.getOne(constant.DB_TABLES.REQUESTS, condition, [request_id]);
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

module.exports = {
  createRequest,
  getRequestById
};
