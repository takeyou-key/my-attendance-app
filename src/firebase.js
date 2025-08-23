// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD7wO83JGrE9-q28JKj3DBX8g_glG9CApQ",
  authDomain: "attendance-app-c014d.firebaseapp.com",
  projectId: "attendance-app-c014d",
  storageBucket: "attendance-app-c014d.firebasestorage.app",
  messagingSenderId: "560248939366",
  appId: "1:560248939366:web:905f7872f9d9ae1ffd5ea7",
  measurementId: "G-LXMFW6JNZZ"
};

// Initialize Firebase with error handling
let app;
let auth;
let db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization failed:', error);
  // Fallback: create dummy objects to prevent app crash
  app = null;
  auth = null;
  db = null;
}

// Initialize Firebase services
export { auth, db };