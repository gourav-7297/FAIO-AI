import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDkU0TIEMrNccSYe3q2p2GjOKU7KX8cxrs",
    authDomain: "faio-ai.firebaseapp.com",
    projectId: "faio-ai",
    storageBucket: "faio-ai.firebasestorage.app",
    messagingSenderId: "966686074574",
    appId: "1:966686074574:web:d359de04b8b2908d32129f",
    measurementId: "G-KPMLQT9NDY"
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
