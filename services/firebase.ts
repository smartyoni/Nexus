// services/firebase.ts
// Firebase configuration. Replace with your actual Firebase project configuration.

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// import { getAuth } from 'firebase/auth'; // Uncomment if authentication is needed

const firebaseConfig = {
  apiKey: "AIzaSyB8XHkT_DedTncHBUSu8d5AwjJLXqDFP2g",
  authDomain: "smartrealapp.firebaseapp.com",
  projectId: "smartrealapp",
  storageBucket: "smartrealapp.firebasestorage.app",
  messagingSenderId: "651193312612",
  appId: "1:651193312612:web:47e8a1780f9c2cd3a94671"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Authentication (if needed)
// export const auth = getAuth(app);
