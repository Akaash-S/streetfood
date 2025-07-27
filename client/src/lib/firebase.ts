import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

// Use valid Firebase config or provide development fallback
const firebaseConfig = {
  apiKey: "AIzaSyBo9digc9kjAowcTLyag75EkFjFC7ppnA4",
  authDomain: "campus-foodorder.firebaseapp.com",
  projectId: "campus-foodorder",
  storageBucket: "campus-foodorder.firebasestorage.app",
  messagingSenderId: "169647404106",
  appId: "1:169647404106:web:6fb24dbd91553d53f862b3",
  measurementId: "G-2F1CVB3BN1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Auth functions
export const signIn = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signUp = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const logout = () => {
  return signOut(auth);
};

export const onAuthChange = (callback: (user: any) => void) => {
  return onAuthStateChanged(auth, callback);
};
