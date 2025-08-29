// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ⚡ Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB-FzcYMFejRdYDHxhQQoQgjzxSFqpC26c",
  authDomain: "redsol-8a25b.firebaseapp.com",
  projectId: "redsol-8a25b",
  storageBucket: "redsol-8a25b.firebasestorage.app",
  messagingSenderId: "604895797784",
  appId: "1:604895797784:web:148bed9fcbb28668ee596d",
  measurementId: "G-2RWM7G6EJH"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// 🔐 Autenticación
export const auth = getAuth(app);

// 📦 Firestore
export const db = getFirestore(app);

// 🚪 Funciones de login/logout
export const login = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const logout = () => signOut(auth);
