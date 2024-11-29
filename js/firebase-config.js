// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyChbFyLFkELidW7oSW0hiolmfscLaKTDzg",
    authDomain: "aimid-6731b.firebaseapp.com",
    databaseURL: "https://aimid-6731b-default-rtdb.firebaseio.com",
    projectId: "aimid-6731b",
    storageBucket: "aimid-6731b.firebasestorage.app",
    messagingSenderId: "568462521581",
    appId: "1:568462521581:web:d27295fc87247bae0408e4",
    measurementId: "G-45VZ0Q1978"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.database();