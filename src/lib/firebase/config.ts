// Firebase Configuration
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAnalytics, type Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDx67F35SmSMgzP4zLnGWOe3EjDVic0v30",
  authDomain: "accounting-app-4e0a4.firebaseapp.com",
  projectId: "accounting-app-4e0a4",
  storageBucket: "accounting-app-4e0a4.firebasestorage.app",
  messagingSenderId: "61569094510",
  appId: "1:61569094510:web:7d08f76bd1b747a44d677f",
  measurementId: "G-TP3WC4GVMK"
};

// Initialize Firebase (client-side only)
function getFirebaseApp(): FirebaseApp {
  if (typeof window === "undefined") {
    throw new Error("Firebase can only be initialized on the client side");
  }

  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApps()[0];
}

function getFirebaseAnalytics(): Analytics | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return getAnalytics(getFirebaseApp());
  } catch {
    return null;
  }
}

export const app = typeof window !== "undefined" ? getFirebaseApp() : ({} as FirebaseApp);
export const analytics = typeof window !== "undefined" ? getFirebaseAnalytics() : null;
