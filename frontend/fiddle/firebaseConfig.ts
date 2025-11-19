// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBFLS2X1C0O1xXNHO4hLm3I_owYQTpfkRU",
  authDomain: "fiddle-f7bf6.firebaseapp.com",
  projectId: "fiddle-f7bf6",
  storageBucket: "fiddle-f7bf6.firebasestorage.app",
  messagingSenderId: "64117752072",
  appId: "1:64117752072:web:6795c5381de1bad3c36cbd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);