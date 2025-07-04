const constant = require("../helpers/constants");
const db = require("../helpers/dbHelper");

const createOffers = async (req, res) => {
  try {
    const data = req.body;
    data.status = constant.OFFERS_STATUS.PENDING;
    data.created_at = new Date();

    // Check if required fields are present
    if (!data.provider_id) {
      return res.status(constant.HTTP_STATUS.BAD_REQUEST).json({message: "provider_id is required"});
    }

    // Check if provider has enough platform tokens
    const provider = await db.getOne(
      constant.DB_TABLES.USERS, 
      "WHERE user_id = $1", 
      [data.provider_id]
    );

    if (!provider) {
      return res.status(constant.HTTP_STATUS.NOT_FOUND).json({message: "Provider not found"});
    }

    if (provider.platform_tokens < 1) {
      return res.status(constant.HTTP_STATUS.BAD_REQUEST).json({
        message: "Insufficient platform tokens. You need at least 1 token to create an offer."
      });
    }

    const offer = await db.create(constant.DB_TABLES.OFFERS, data);

    if (!offer) {
      return res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message: "Failed to create offer"});
    }

    // Deduct 1 platform token from provider
    const updatedTokens = provider.platform_tokens - 1;
    await db.update(
      constant.DB_TABLES.USERS,
      { platform_tokens: updatedTokens },
      'WHERE user_id = $1',
      [data.provider_id]
    );
    
    // Get the request details to find the consumer and emit notification
    const request = await db.getOne(
      constant.DB_TABLES.REQUESTS,
      "WHERE request_id = $1",
      [data.request_id]
    );

    if (request) {
      // Get io instance from app
      const io = req.app.get("io");
      
      // Emit to specific consumer
      const notificationData = {
        offer_id: offer.offer_id,
        request_id: data.request_id,
        request_title: request.title,
        provider_id: data.provider_id,
        provider_name: provider?.name || "Provider",
        budget: data.budget,
        timeframe: data.timeframe,
        created_at: offer.created_at,
        message: `New offer received for "${request.title}" - LKR ${data.budget}`
      };

      // Emit to the consumer who created the request
      io.emit(`new_offer_${request.user_id}`, notificationData);
    }
    
    res.status(constant.HTTP_STATUS.CREATED).json({
      ...offer,
      platform_tokens: updatedTokens
    });
  } catch (err) {
    console.error("Error creating offer:", err);
    res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error"
    });
    throw err;
  }
};

const getOfferById = async (req, res) => {
  try {
    const offer_id = req.params.offer_id;
    const condition = "WHERE (offer_id = $1)";
    const offer = await db.getOne(constant.DB_TABLES.OFFERS, condition, [offer_id]);
    
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
  const offer_id = req.params.offer_id;
  const newStatus = req.body.status;
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
    // First, get the offer details to get request_id and provider_id
    const offer = await db.getOne(
      constant.DB_TABLES.OFFERS,
      'WHERE offer_id = $1',
      [offer_id]
    );

    if (!offer) {
      return res.status(constant.HTTP_STATUS.NOT_FOUND).json({ 
        message: "Offer Not Found" 
      });
    }

    // Get provider details to refund the platform token
    const provider = await db.getOne(
      constant.DB_TABLES.USERS,
      "WHERE user_id = $1",
      [offer.provider_id]
    );

    if (!provider) {
      return res.status(constant.HTTP_STATUS.NOT_FOUND).json({
        message: "Provider not found"
      });
    }

    // Refund 1 platform token to provider
    const updatedTokens = provider.platform_tokens + 1;
    await db.update(
      constant.DB_TABLES.USERS,
      { platform_tokens: updatedTokens },
      'WHERE user_id = $1',
      [offer.provider_id]
    );

    // Get the request details to find the consumer and emit notification
    const request = await db.getOne(
      constant.DB_TABLES.REQUESTS,
      "WHERE request_id = $1",
      [offer.request_id]
    );

    if (request) {
      // Get io instance from app
      const io = req.app.get("io");
      
      // Emit to specific consumer
      const notificationData = {
        offer_id: offer.offer_id,
        request_id: offer.request_id,
        request_title: request.title,
        provider_id: offer.provider_id,
        provider_name: provider?.name || "Provider",
        budget: offer.budget,
        timeframe: offer.timeframe,
        created_at: offer.created_at,
        message: `Offer deleted for "${request.title}" from ${provider?.name || "Provider"} - LKR ${offer.budget}`
      };

      // console.log(`Emitting deletion of offer to consumer: delete_offer_${request.user_id}`, notificationData);
      
      // Emit to the consumer who created the request
      io.emit(`delete_offer_${request.user_id}`, notificationData);
    }

    // Delete the offer
    const deletedOffer = await db.remove(
      constant.DB_TABLES.OFFERS,
      'WHERE offer_id = $1',
      [offer_id]
    );
    
    if (deletedOffer) {
      res.status(constant.HTTP_STATUS.OK).json({ 
        message: "Offer deleted successfully",
        platform_tokens: updatedTokens,
        refund_given: true
      });
    } else {
      res.status(constant.HTTP_STATUS.NOT_FOUND).json({ 
        message: "Offer Not Found" 
      });
    }
  } catch (err) {
    console.error("Error deleting offer:", err);
    res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
      error: "Internal server error",
      details: err.message 
    });
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
      return res.status(constant.HTTP_STATUS.OK).json([]);
    }
    
    // Enrich offers with provider information
    const enrichedOffers = await Promise.all(
      offers.map(async (offer) => {
        try {
          // Get provider user details
          const provider = await db.getOne(
            constant.DB_TABLES.USERS,
            "WHERE user_id = $1",
            [offer.provider_id]
          );
          
          // Get provider rating and review count
          const providerDetails = await db.getOne(
            constant.DB_TABLES.PROVIDERS,
            "WHERE user_id = $1",
            [offer.provider_id]
          );
          
          return {
            ...offer,
            provider_name: provider?.name || "Provider",
            provider_rating: providerDetails?.average_rating || 0,
            provider_review_count: providerDetails?.review_count || 0
          };
        } catch (error) {
          console.error("Error enriching offer with provider data:", error);
          return {
            ...offer,
            provider_name: "Provider",
            provider_rating: 0,
            provider_review_count: 0
          };
        }
      })
    );
    
    res.status(constant.HTTP_STATUS.OK).json(enrichedOffers);
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

    const condition = "WHERE provider_id = $1 AND status = 'pending' ORDER BY created_at DESC";
    const offers = await db.getAll(constant.DB_TABLES.OFFERS, condition, [provider_id]);
    
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

const updateOfferBudget = async (req, res) => {
  const offer_id = req.params.offer_id;
  const { budget } = req.body;

  try {
    // Validate input
    if (!budget || budget <= 0) {
      return res.status(constant.HTTP_STATUS.BAD_REQUEST).json({
        message: "Valid budget amount is required"
      });
    }

    // First check if offer exists and is pending
    const offer = await db.getOne(
      constant.DB_TABLES.OFFERS,
      'WHERE offer_id = $1',
      [offer_id]
    );

    if (!offer) {
      return res.status(constant.HTTP_STATUS.NOT_FOUND).json({
        message: "Offer not found"
      });
    }

    if (offer.status !== constant.OFFERS_STATUS.PENDING) {
      return res.status(constant.HTTP_STATUS.BAD_REQUEST).json({
        message: "Only pending offers can be updated"
      });
    }

    // Update the offer budget
    const updateData = { budget: budget };
    const condition = 'WHERE offer_id = $1';
    const updatedOffer = await db.update(
      constant.DB_TABLES.OFFERS,
      updateData,
      condition,
      [offer_id]
    );

    if (updatedOffer) {
      // Get request and provider details for notification
      const request = await db.getOne(
        constant.DB_TABLES.REQUESTS,
        "WHERE request_id = $1",
        [offer.request_id]
      );

      if (request) {
        const provider = await db.getOne(
          constant.DB_TABLES.USERS,
          "WHERE user_id = $1",
          [offer.provider_id]
        );

        // Get io instance and emit budget update notification
        const io = req.app.get("io");
        const notificationData = {
          offer_id: offer.offer_id,
          request_id: offer.request_id,
          request_title: request.title,
          provider_id: offer.provider_id,
          provider_name: provider?.name || "Provider",
          old_budget: offer.budget,
          new_budget: budget,
          timeframe: offer.timeframe,
          message: `Offer budget updated for "${request.title}" - New price: LKR ${budget} (was LKR ${offer.budget})`
        };

        // console.log(`Emitting offer budget update to consumer: update_offer_${request.user_id}`, notificationData);
        io.emit(`update_offer_${request.user_id}`, notificationData);
      }

      res.status(constant.HTTP_STATUS.OK).json(updatedOffer);
    } else {
      res.status(constant.HTTP_STATUS.NOT_FOUND).json({
        message: "Offer not found"
      });
    }
  } catch (err) {
    console.error("Error updating offer budget:", err);
    res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: "Internal server error",
      details: err.message
    });
  }
};

const rejectOtherOffers = async (req, res) => {
  const { request_id } = req.params;
  const { accepted_offer_id } = req.body;

  try {
    // Validate input
    if (!request_id || !accepted_offer_id) {
      return res.status(constant.HTTP_STATUS.BAD_REQUEST).json({
        message: "request_id and accepted_offer_id are required"
      });
    }

    // Get all pending offers for this request except the accepted one
    const offersToReject = await db.getAll(
      constant.DB_TABLES.OFFERS,
      "WHERE request_id = $1 AND offer_id != $2 AND status = $3",
      [request_id, accepted_offer_id, constant.OFFERS_STATUS.PENDING]
    );

    if (offersToReject.length === 0) {
      return res.status(constant.HTTP_STATUS.OK).json({
        message: "No other offers to reject",
        rejected_count: 0
      });
    }    // Update all other offers to rejected status
    // Using direct query since dbHelper doesn't handle complex WHERE clauses with SET parameters correctly
    const updateQuery = `
      UPDATE ${constant.DB_TABLES.OFFERS} 
      SET status = $4 
      WHERE request_id = $1 AND offer_id != $2 AND status = $3
      RETURNING *
    `;
    
    const updateResult = await db.query(updateQuery, [
      request_id, 
      accepted_offer_id, 
      constant.OFFERS_STATUS.PENDING,
      constant.OFFERS_STATUS.REJECTED
    ]);

    // Get request details for notifications
    const request = await db.getOne(
      constant.DB_TABLES.REQUESTS,
      "WHERE request_id = $1",
      [request_id]
    );

    // Send notifications to all rejected providers
    const io = req.app.get("io");
    if (io && request) {
      const rejectionPromises = offersToReject.map(async (offer) => {
        // Get provider details
        const provider = await db.getOne(
          constant.DB_TABLES.USERS,
          "WHERE user_id = $1",
          [offer.provider_id]
        );

        // Refund platform token to provider
        if (provider) {
          const updatedTokens = provider.platform_tokens + 1;
          await db.update(
            constant.DB_TABLES.USERS,
            { platform_tokens: updatedTokens },
            'WHERE user_id = $1',
            [offer.provider_id]
          );

          // Send rejection notification
          const notificationData = {
            offer_id: offer.offer_id,
            request_id: request_id,
            request_title: request.title,
            message: `Your offer for "${request.title}" was not selected. Platform token refunded.`,
            platform_tokens: updatedTokens
          };

          io.emit(`offer_declined_${offer.provider_id}`, notificationData);
        }
      });

      await Promise.all(rejectionPromises);
    }

    res.status(constant.HTTP_STATUS.OK).json({
      message: "Other offers rejected successfully",
      rejected_count: offersToReject.length
    });

  } catch (err) {
    console.error("Error rejecting other offers:", err);
    res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
      details: err.message
    });
  }
};

module.exports = {
  createOffers,
  getOfferById,
  updateOfferStatus,
  updateOfferBudget,
  deleteOffer,
  getOffersByRequestId,
  getOffersByProviderId,
  getOfferByProviderAndRequest,
  rejectOtherOffers
};
