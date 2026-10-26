import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuración de Firebase provista por el usuario
export const firebaseConfig = {
  apiKey: "AIzaSyBNuQQb3JNZHj4LVA_V-wjwN70YedJoD_g",
  authDomain: "ssss-42b23.firebaseapp.com",
  projectId: "ssss-42b23",
  storageBucket: "ssss-42b23.firebasestorage.app",
  messagingSenderId: "757251979670",
  appId: "1:757251979670:web:3841edd75918d1877645b7",
  measurementId: "G-29P5NKBN68"
};

// Inicialización segura de Firebase
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// Proveedor de Autenticación de Google
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({
  prompt: 'select_account'
});
