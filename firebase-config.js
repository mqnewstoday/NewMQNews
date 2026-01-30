// 1. Import Library
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 2. Data Config ASLI Punya Kamu
const firebaseConfig = {
  apiKey: "AIzaSyCMDVcDKxaf3v7iHZYpQ1k6k0G55yW9njQ",
  authDomain: "mq-news-today.firebaseapp.com",
  projectId: "mq-news-today",
  storageBucket: "mq-news-today.firebasestorage.app",
  messagingSenderId: "310073854630",
  appId: "1:310073854630:web:25dac91125b3be85f94267",
  measurementId: "G-0VMCLH4RD5"
};

// 3. Initialize Firebase
const app = initializeApp(firebaseConfig);

// 4. Siapkan Auth & Database
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// 5. Ekspor (PENTING: Jangan ada typo disini)
export { auth, db, googleProvider };
