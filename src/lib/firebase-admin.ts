import "server-only";
import * as admin from "firebase-admin";

interface FirebaseAdminConfig {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

function getFirebaseAdminConfig(): FirebaseAdminConfig | null {
  // Option 1: Single JSON string environment variable
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    } catch {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY");
    }
  }

  // Option 2: Individual environment variables
  if (
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    return {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Some environments/editors might handle newlines differently. 
      // We check if it has literal \n and replace them, but also ensure it doesn't break if it's already correct.
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  }

  return null;
}

function createFirebaseAdminApp() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const config = getFirebaseAdminConfig();

  if (!config) {
    throw new Error(
      "Missing Firebase Admin credentials. Please set FIREBASE_SERVICE_ACCOUNT_KEY or individual variables."
    );
  }

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: config.projectId,
      clientEmail: config.clientEmail,
      privateKey: config.privateKey,
    }),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

const firebaseAdminApp = createFirebaseAdminApp();

export const adminAuth = firebaseAdminApp.auth();
export const adminDb = firebaseAdminApp.firestore();
export const adminStorage = firebaseAdminApp.storage();
export const adminRtdb = firebaseAdminApp.database();
