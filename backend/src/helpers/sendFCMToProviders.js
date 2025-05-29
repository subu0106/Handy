const admin = require("firebase-admin");
const db = require("./dbHelper")

admin.initializeApp({
  credential: admin.credential.cert(require("../serviceAccountKey.json")),
});

async function sendFcmToProvider(fcmToken, payload) {
  try {
    const response = await admin.messaging().send({
      token: fcmToken,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
    });
    return response;
  } catch (err) {
    console.error("FCM send error:", err);
    throw err;
  }
}

async function broadcastToAllProviders(payload) {

  const providers = await db.getAll("providers", "WHERE fcm_token IS NOT NULL", []);

  for (const provider of providers) {
    try {
      await sendFcmToProvider(provider.fcm_token, payload);
    } catch (err) {
      console.error(`Failed to send to provider ${provider.user_id}:`, err);
    }
  }
}

module.exports = { sendFcmToProvider,broadcastToAllProviders };