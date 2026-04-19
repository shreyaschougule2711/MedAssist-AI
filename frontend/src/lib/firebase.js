import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSy_PLACEHOLDER",
  authDomain: "medassist-ai-demo.firebaseapp.com",
  projectId: "medassist-ai-demo",
  storageBucket: "medassist-ai-demo.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
