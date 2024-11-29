// Get Firebase services
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

// Initialize Firebase
firebase.initializeApp({
  apiKey: '<API_KEY>',
  authDomain: '<AUTH_DOMAIN>',
  projectId: '<PROJECT_ID>',
});

// Database references
const db = firebase.firestore();
const auth = firebase.auth();

// Authentication functions
function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            window.location.href = 'dashboard.html';
        })
        .catch((error) => {
            console.error('Login error:', error);
            alert(error.message);
        });
}

function register() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const name = document.getElementById('name').value;

    // Create user account
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            
            // Create user document in Firestore
            return db.collection('users').doc(user.uid).set({
                name: name,
                email: email,
                aimId: generateAimId(),
                createdAt: new Date().toISOString()
            });
        })
        .then(() => {
            alert('Account created successfully!');
            window.location.href = 'dashboard.html';
        })
        .catch((error) => {
            console.error('Registration error:', error);
            alert(error.message);
        });
}

// Generate unique 12-digit AIM ID
function generateAimId() {
    return 'AIM' + Math.random().toString().substring(2, 11);
}

// Check authentication state
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        if (window.location.pathname.includes('index.html')) {
            window.location.href = 'dashboard.html';
        }
    } else {
        // User is signed out
        if (!window.location.pathname.includes('index.html')) {
            window.location.href = 'index.html';
        }
    }
});

function logout() {
    auth.signOut()
        .then(() => {
            window.location.href = 'index.html';
        })
        .catch((error) => {
            console.error('Logout error:', error);
            alert(error.message);
        });
}

// Make functions globally available
window.login = login;
window.register = register;
window.logout = logout;
