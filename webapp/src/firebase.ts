// Import the functions you need from the Firebase SDKs
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAMDZjWXXctT2k6YULKMsJGnWNhi-jcfds",
  authDomain: "handy-81456.firebaseapp.com",
  projectId: "handy-81456",
  storageBucket: "handy-81456.firebasestorage.app",
  messagingSenderId: "202418796029",
  appId: "1:202418796029:web:1617893c98fc46dbfd9594"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
export { app, auth, db, storage };
