import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
};

// Initialize Firebase Admin SDK
function createFirebaseAdminApp() {
  if (getApps().length === 0) {
    return initializeApp(firebaseAdminConfig);
  } else {
    return getApps()[0];
  }
}

const app = createFirebaseAdminApp();

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);

export default app;
