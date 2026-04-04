import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC7PYolesLq0zxms1TEpTuGaKfZlGbEWh0",
  authDomain: "online-shopping-website-cd87b.firebaseapp.com",
  projectId: "online-shopping-website-cd87b",
  storageBucket: "online-shopping-website-cd87b.firebasestorage.app",
  messagingSenderId: "1010592273037",
  appId: "1:1010592273037:web:4652c1a3d3c2f29d7c08c4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
