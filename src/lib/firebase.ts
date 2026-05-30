import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Web app's Firebase configuration - securely loaded via env vars with defaults
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDkU0TIEMrNccSYe3q2p2GjOKU7KX8cxrs",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "faio-ai.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "faio-ai",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "faio-ai.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "966686074574",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:966686074574:web:d359de04b8b2908d32129f",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-KPMLQT9NDY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (only in browser environments that support it)
const analytics = isSupported().then(supported => supported ? getAnalytics(app) : null);

// Initialize Firebase services
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, auth, googleProvider, db, storage };
