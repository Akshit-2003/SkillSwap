// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyD7313nRbTG4ZZ7gPE0KTXUVELsCY-8j3I",
    authDomain: "illswap.firebaseapp.com",
    projectId: "illswap",
    storageBucket: "illswap.firebasestorage.app",
    messagingSenderId: "307975565074",
    appId: "1:307975565074:web:74295605b0825869370dcb",
    measurementId: "G-P6YGJ7L5DY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();