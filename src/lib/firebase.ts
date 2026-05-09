// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDkKU9qlJOrMsM_TXIieUYGmGNhFgJOfEc",
  authDomain: "sanskar-shopping.firebaseapp.com",
  projectId: "sanskar-shopping",
  storageBucket: "sanskar-shopping.firebasestorage.app",
  messagingSenderId: "682795212631",
  appId: "1:682795212631:web:1d38889c84141fdd886812",
  measurementId: "G-BHY7NDT7VV"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Analytics conditionally (it only works in the browser)
let analytics;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, db, storage, analytics, googleProvider };
