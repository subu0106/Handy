const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const constant = require("../helpers/constants");
const db = require("../helpers/dbHelper");

const TOKEN_PACKAGE_MAP = {
    consumer: {
        1: 100,
        20: 1800,
        50: 4000
    },
    provider: {
        1: 150,
        20: 2800,
        50: 6500
    }
};

// Create payment intent for token purchase
const createPaymentIntent = async (req, res) => {
    try {
        const { tokens, quantity, userType, user_id } = req.body;

        // Validate input
        if (!tokens || !quantity || !userType || !user_id) {
            return res.status(constant.HTTP_STATUS.BAD_REQUEST).json({
                message: "Missing required fields: tokens, quantity, userType, user_id"
            });
        }

        if (!TOKEN_PACKAGE_MAP[userType] || !TOKEN_PACKAGE_MAP[userType][tokens]) {
            return res.status(constant.HTTP_STATUS.BAD_REQUEST).json({
                message: "Invalid token package or user type"
            });
        }

        // Calculate total amount
        const unitPrice = TOKEN_PACKAGE_MAP[userType][tokens];
        const totalTokens = tokens * quantity;
        const totalAmount = unitPrice * quantity;

        // Create payment intent with Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmount * 100, // Stripe expects amount in cents (LKR * 100)
            currency: 'lkr',
            metadata: {
                user_id,
                userType,
                platform_tokens: totalTokens.toString(),
                quantity: quantity.toString(),
                unitPrice: unitPrice.toString()
            },
            description: `Platform token purchase: ${totalTokens} tokens for ${userType}`
        });

        res.status(constant.HTTP_STATUS.OK).json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            amount: totalAmount,
            platform_tokens: totalTokens
        });

    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            message: "Failed to create payment intent",
            error: error.message
        });
    }
};

// Confirm payment and update user tokens
const confirmPayment = async (req, res) => {
    try {
        const paymentIntentId = req.params.paymentIntentId;

        if (!paymentIntentId) {
            return res.status(constant.HTTP_STATUS.BAD_REQUEST).json({
                message: "Payment intent ID is required"
            });
        }

        // Retrieve payment intent from Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
            return res.status(constant.HTTP_STATUS.BAD_REQUEST).json({
                message: "Payment not completed"
            });
        }

        // Extract metadata
        const { user_id, platform_tokens, userType } = paymentIntent.metadata;
        const tokensToAdd = parseInt(platform_tokens);

        // Update user's platform tokens in database
        const currentUser = await db.getOne(
            constant.DB_TABLES.USERS,
            'WHERE user_id = $1',
            [user_id]
        );

        if (!currentUser) {
            return res.status(constant.HTTP_STATUS.NOT_FOUND).json({
                message: "User not found"
            });
        }

        // Increment the user's platform_tokens
        const updatedPlatformTokens = currentUser.platform_tokens + tokensToAdd;

        await db.update(
            constant.DB_TABLES.USERS,
            {
                platform_tokens: updatedPlatformTokens
            },
            'WHERE user_id = $1',
            [user_id]
        );

        res.status(constant.HTTP_STATUS.OK).json({
            message: "Payment confirmed and platform tokens updated",
            platform_tokens: updatedPlatformTokens
        });

    } catch (error) {
        console.error('Error confirming payment:', error);
        res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            message: "Failed to confirm payment",
            error: error.message
        });
    }
};

module.exports = {
    createPaymentIntent,
    confirmPayment
};




