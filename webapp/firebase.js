// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCShqFyM0aPhoOJo_CasWZuHJ4dUyObGYI",
  authDomain: "sample-e436d.firebaseapp.com",
  projectId: "sample-e436d",
  storageBucket: "sample-e436d.firebasestorage.app",
  messagingSenderId: "893942939634",
  appId: "1:893942939634:web:47e91ed8957e8a44e8756b",
  measurementId: "G-4J7DHM6KM2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);