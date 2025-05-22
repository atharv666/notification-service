const admin = require("firebase-admin");
const axios = require("axios");

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_KEY_JSON);
const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

db.collection("allusers").onSnapshot((snapshot) => {
  snapshot.docChanges().forEach(async (change) => {
    if (change.type === "added") {
      const data = change.doc.data();
      const title = data.title;
      const description = data.description;

      const payload = {
        app_id: ONESIGNAL_APP_ID,
        included_segments: ["All"],
        headings: { en: title },
        contents: { en: description },
      };

      try {
        const response = await axios.post("https://onesignal.com/api/v1/notifications", payload, {
          headers: {
            Authorization: `Basic ${ONESIGNAL_API_KEY}`,
            "Content-Type": "application/json",
          },
        });
        console.log("Push sent:", response.data);
      } catch (error) {
        console.error("Push failed:", error);
      }
    }
  });
});
