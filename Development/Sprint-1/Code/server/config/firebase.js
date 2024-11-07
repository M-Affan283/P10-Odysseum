import admin from "firebase-admin";
import serviceAccount from "./firebaseConfig.json" assert { type: "json" };

//Put this in a .env file later
const FIREBASE_STORAGE_BUCKET_NAME='gs://odysseumstorage.appspot.com'

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: FIREBASE_STORAGE_BUCKET_NAME
});

const db = admin.firestore(); //might need might not
const storage = admin.storage().bucket(); // This is the bucket we are using for the project. We will store user images here.

export { db,storage };

// console.log(process.env.FIREBASE_STORAGE_BUCKET_NAME);