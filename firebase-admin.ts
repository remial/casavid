import { initFirestore } from "@auth/firebase-adapter";
import admin from "firebase-admin";

const getApp = () => {
    if (admin.apps.length) {
        return admin.apps[0]!;
    }
    return admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY
                ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/gm, "\n")
                : undefined,
        }),
    });
};

const app = getApp();

const adminDB = initFirestore({
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY
            ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/gm, "\n")
            : undefined,
    }),
});

const adminAuth = admin.auth(app);
const storage = admin.storage(app);

export {adminDB, adminAuth, storage};