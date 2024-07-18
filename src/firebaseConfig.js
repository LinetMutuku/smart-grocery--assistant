import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // Import Firebase Storage

const firebaseConfig = {
    apiKey: "AIzaSyCaFeU2wk-BVbwWT8baAYSqAE-R01Rz-bI",
    authDomain: "smart-grocery-assistant-c891c.firebaseapp.com",
    projectId: "smart-grocery-assistant-c891c",
    storageBucket: "smart-grocery-assistant-c891c.appspot.com",
    messagingSenderId: "1022112886241",
    appId: "1:1022112886241:web:8c126679fbe6af216a36a0",
    measurementId: "G-RDK3DFS8TD"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app); // Initialize Firebase Storage
export { db,auth,storage, analytics };
