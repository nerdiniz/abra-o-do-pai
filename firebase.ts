import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    projectId: "abracodopai-18383",
    appId: "1:150892835100:web:f2b07b90f1e6e0c1290ad9",
    storageBucket: "abracodopai-18383.firebasestorage.app",
    apiKey: "AIzaSyCw9Ts0OgCqdnrLA4cdTXPmByXEqfa46bM",
    authDomain: "abracodopai-18383.firebaseapp.com",
    messagingSenderId: "150892835100",
    measurementId: "G-3G3X574JHS"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
