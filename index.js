const functions = require("firebase-functions");
const admin = require("firebase-admin");
const OneSignal = require("onesignal-node");

// Parse the Firebase service account key from environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_KEY_JSON);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Setup OneSignal client
const client = new OneSignal.Client({
  app: {
    appAuthKey: process.env.ONESIGNAL_API_KEY,   // Updated key name here
    appId: process.env.ONESIGNAL_APP_ID
  }
});

exports.sendNotification = functions.firestore
  .document("allusers/{eventId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const title = data.title;
    const description = data.description;

    const notification = {
      contents: {
        en: description
      },
      headings: {
        en: title
      },
      included_segments: ['All']
    };

    try {
      const response = await client.createNotification(notification);
      console.log("Notification sent successfully:", response.body);
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  });
