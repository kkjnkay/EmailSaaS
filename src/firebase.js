import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth'; // 🔥 Додали GoogleAuthProvider
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAoiCizZsEHQWxcCWsx9qah7tGZJdMk920",
  authDomain: "emailsaas-e8ae9.firebaseapp.com",
  projectId: "emailsaas-e8ae9",
  storageBucket: "emailsaas-e8ae9.firebasestorage.app",
  messagingSenderId: "389762954537",
  appId: "1:389762954537:web:5bedc2ac1000877a7a3338"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider(); // 🔥 Додали експорт provider