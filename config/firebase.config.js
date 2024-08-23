import serviceAccount from "../json/global-bids-firebase-config.json" assert { type: "json" };

const firebaseAdmin = await import("firebase-admin");

firebaseAdmin.default.initializeApp({
  credential: firebaseAdmin.default.credential.cert(serviceAccount),
  storageBucket: "gs://global-bids.appspot.com",
});

const bucket = firebaseAdmin.default.storage().bucket();

export { bucket };
