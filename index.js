const admin = require("firebase-admin");
const axios = require("axios");

const serviceAccount = require("./firebaseServiceKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const onesignalAppId = "24eca189-29bc-4a16-b090-2a3f08e56ef6";
const onesignalRestApiKey = "os_v2_app_etwkdcjjxrfbnmeqfi7qrzlo6zl5om6vx3zeaiufghj2ebn5g3xgc5d6lhqkoazo6ogoawy4yfy73kmxedldq32xl3btauo6ppandsa";

function sendPushNotification(title, description) {
  const message = {
    app_id: onesignalAppId,
    included_segments: ["All"],
    headings: { en: title },
    contents: { en: description },
  };

  return axios.post("https://onesignal.com/api/v1/notifications", message, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${onesignalRestApiKey}`,
    },
  });
}

function startFirestoreListener() {
  db.collection("allusers").onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const data = change.doc.data();
        const title = data.title || "New Event";
        const description = data.description || "You have a new notification.";

        sendPushNotification(title, description)
          .then((res) => {
            console.log("✅ Notification sent", res.data.id);
          })
          .catch((err) => {
            console.error("❌ Failed to send notification", err.response?.data || err.message);
          });
      }
    });
  });
}

startFirestoreListener();
