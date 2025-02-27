import admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";

// Firebase Admin SDK initialize karna (yahan service account ka JSON use hoga)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const adminAuth = getAuth();
export { adminAuth };
