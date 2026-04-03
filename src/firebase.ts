import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAGOINn0km_IM8Y1UNC8bJ_AEnempFl_fs",
  authDomain: "online-shopping-website-9ff0a.firebaseapp.com",
  projectId: "online-shopping-website-9ff0a",
  storageBucket: "online-shopping-website-9ff0a.firebasestorage.app",
  messagingSenderId: "954099670109",
  appId: "1:954099670109:web:f7a13eefaa5cc6306781b4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
