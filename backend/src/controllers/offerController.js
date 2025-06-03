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

const deleteOffer = async (req, res) => {
  const offer_id = req.params.offer_id;
  try {
    const deletedOffer = await db.remove(
      constant.DB_TABLES.OFFERS,
      'WHERE offer_id = $1',
      [offer_id]
    );
    if (deletedOffer) {
      res.status(constant.HTTP_STATUS.OK).json({ message: "Offer deleted successfully" });
    } else {
      res.status(constant.HTTP_STATUS.NOT_FOUND).json({ message: "Offer Not Found" });
    }
  } catch (err) {
    res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
  }
};

const getOffersByRequestId = async (req, res) => {
  try {
    const { requestId } = req.query;
    
    if (!requestId) {
      return res.status(constant.HTTP_STATUS.BAD_REQUEST).json({
        message: "requestId is required"
      });
    }

    const condition = "WHERE request_id = $1";
    const offers = await db.getAll(constant.DB_TABLES.OFFERS, condition, [requestId]);
    
    if (!offers || offers.length === 0) {
      return res.status(constant.HTTP_STATUS.OK).json([]); // Return empty array instead of 404
    }
    
    res.status(constant.HTTP_STATUS.OK).json(offers);
  } catch (err) {
    console.error('Error fetching offers:', err);
    res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error"
    });
  }
};

const getOffersByProviderId = async (req, res) => {
  try {
    const { provider_id } = req.params;
    
    if (!provider_id) {
      return res.status(constant.HTTP_STATUS.BAD_REQUEST).json({
        message: "provider_id is required"
      });
    }

    // Get offers by provider
    const condition = "WHERE provider_id = $1 ORDER BY created_at DESC";
    const offers = await db.getAll(constant.DB_TABLES.OFFERS, condition, [provider_id]);
    
    // Enrich offers with request details
    const enrichedOffers = await Promise.all(
      offers.map(async (offer) => {
        try {
          const request = await db.getOne(
            constant.DB_TABLES.REQUESTS, 
            "WHERE request_id = $1", 
            [offer.request_id]
          );
          return {
            ...offer,
            request_title: request?.title,
            request_description: request?.description,
            customer_budget: request?.budget,
            request_location: request?.location
          };
        } catch (error) {
          return offer;
        }
      })
    );
    
    res.status(constant.HTTP_STATUS.OK).json(enrichedOffers || []);
  } catch (err) {
    console.error('Error fetching provider offers:', err);
    res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error"
    });
  }
};

const getOfferByProviderAndRequest = async (req, res) => {
  try {
    const { provider_id, request_id } = req.params;
    
    const condition = "WHERE provider_id = $1 AND request_id = $2";
    const offer = await db.getOne(constant.DB_TABLES.OFFERS, condition, [provider_id, request_id]);
    
    if (!offer) {
      return res.status(constant.HTTP_STATUS.NOT_FOUND).json({
        message: "Offer not found"
      });
    }
    
    res.status(constant.HTTP_STATUS.OK).json(offer);
  } catch (err) {
    console.error('Error fetching offer:', err);
    res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error"
    });
  }
};

// Update the module.exports
module.exports = {
  createOffers,
  getOfferById,
  updateOfferStatus,
  deleteOffer,
  getOffersByRequestId,
  getOffersByProviderId, // Add this
  getOfferByProviderAndRequest // Add this
};
