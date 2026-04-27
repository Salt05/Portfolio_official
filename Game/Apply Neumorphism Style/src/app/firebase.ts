import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAhx0_1d8PQUkhJwVJ8exqePHZ74EG1Rd8",
  authDomain: "numstrata-989ce.firebaseapp.com",
  projectId: "numstrata-989ce",
  storageBucket: "numstrata-989ce.firebasestorage.app",
  messagingSenderId: "278330878957",
  appId: "1:278330878957:web:a50f716076124f50eb95e4",
  measurementId: "G-NBBC37NCGV"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
