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

const updateOfferStatus = async (req, res) => {
  const offer_id=req.params.offer_id;
  const newStatus = req.body.status
  const validOfferStatusArray = [constant.OFFERS_STATUS.ACCEPTED, constant.OFFERS_STATUS.PENDING, constant.OFFERS_STATUS.REJECTED];
  const condition = 'WHERE offer_id=$1';

  if (validOfferStatusArray.includes(newStatus)) {
    try {
      const updateData = {"status": newStatus};
      const updatedOffer = await db.update(table=constant.DB_TABLES.OFFERS, data=updateData, conditions=condition, params=[offer_id]);
      if (updatedOffer){
        res.status(constant.HTTP_STATUS.OK).json(updatedOffer);
      } else {
        res.status(constant.HTTP_STATUS.NOT_FOUND).json({message:"Offer Not Found"});
      }

    } catch (error) {
      res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  } else {
    res.status(constant.HTTP_STATUS.BAD_REQUEST).json({message:"Invalid Offer Status Provided"});
  }
}

module.exports = {
    createOffers,
    getOfferById,
    updateOfferStatus
    };
