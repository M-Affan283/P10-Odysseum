
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Now you can use `require` to load JSON
const serviceAccount = require('./firebaseConfig.json');

import admin from "firebase-admin";
// import serviceAccount from "./firebaseConfig.json" assert { type: "json" };

const FIREBASE_STORAGE_BUCKET_NAME='gs://odysseumstorage.appspot.com'
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: FIREBASE_STORAGE_BUCKET_NAME
});

// Initializing firestore and storage bucket instance for database access
const db = admin.firestore();               // might need might not
const storage = admin.storage().bucket();   // This is the bucket we are using for the project. We will store user images here.

export { db,storage };
