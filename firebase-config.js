// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAHQtWkkkZVSRbFlT1WmfF9m4_KqyaJHvQ",
  authDomain: "restaurant-project-b46bc.firebaseapp.com",
  projectId: "restaurant-project-b46bc",
  storageBucket: "restaurant-project-b46bc.firebasestorage.app",
  messagingSenderId: "98173898640",
  appId: "1:98173898640:web:06ab90c74cf9ff090a2d15",
  measurementId: "G-0PNB4837QL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };