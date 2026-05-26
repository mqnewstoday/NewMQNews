import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCMDVcDKxaf3v7iHZYpQ1k6k0G55yW9njQ",
  authDomain: "mq-news-today.firebaseapp.com",
  projectId: "mq-news-today",
  storageBucket: "mq-news-today.firebasestorage.app",
  messagingSenderId: "310073854630",
  appId: "1:310073854630:web:25dac91125b3be85f94267",
  measurementId: "G-0VMCLH4RD5"
};

// Initialize Firebase (prevent multiple initialization in Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
