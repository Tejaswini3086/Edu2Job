import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyDSE4jiNikh3T5tOjx8xZPs9DdMWAp_b9o",
  authDomain: "my-project-5500c.firebaseapp.com",
  projectId: "my-project-5500c",
  storageBucket: "my-project-5500c.firebasestorage.app",
  messagingSenderId: "689098020170",
  appId: "1:689098020170:web:a3a56d849997db76d29db3",
  measurementId: "G-X23PWJ946V"
};

export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();