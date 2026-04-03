import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDguuJ0Hyjs53sbcsoPoF8cFd6Zj9UPORc",
  authDomain: "online-shopping-cb2dc.firebaseapp.com",
  projectId: "online-shopping-cb2dc",
  storageBucket: "online-shopping-cb2dc.firebasestorage.app",
  messagingSenderId: "1038279466429",
  appId: "1:1038279466429:web:5dd551d1dc02c8f13c86d4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
