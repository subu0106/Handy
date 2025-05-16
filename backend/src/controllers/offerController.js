const constant = require("../helpers/constants");
const db = require("../helpers/dbHelper");

const createOffers = async (req, res) => {
  try {
    const data = req.body;
    data.status = constant.OFFERS_STATUS.PENDING;
    data.created_at = new Date();

    const offer = await db.create(constant.DB_TABLES.OFFERS, data);
    res.status(constant.HTTP_STATUS.CREATED).json(offer);
  } catch (err) {
    res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR);
    throw err;
  }
};

const getOfferById = async (req, res) => {
  try {
    const offer_id = req.params.offer_id;
    // console.log(offer_id);
    const condition = "WHERE (offer_id = $1)";
    const offer = await db.getOne('public.offers', condition, [offer_id]);
    // const offer = await db.getOne(constant.DB_TABLES.OFFERS, condition, [offer_id]);
    if (!offer){
      res.status(constant.HTTP_STATUS.NOT_FOUND).json({message: "Offer not found"});
    } else {
      res.status(constant.HTTP_STATUS.OK).json(offer);
    }
  } catch(err){
    res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR);
    throw err;
  }
}

module.exports = {
    createOffers,
    getOfferById
    };
