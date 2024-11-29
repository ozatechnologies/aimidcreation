import { 
    getAuth,
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

import { 
    getDatabase,
    ref,
    get,
    query,
    orderByChild,
    equalTo,
    limitToLast,
    child,
    onValue
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

import { app } from './firebase-config.js';

// Initialize Firebase services
const auth = getAuth(app);
const db = getDatabase(app);

// Get current user data
let currentUser = null;

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        const userSnapshot = await get(child(ref(db, 'users'), user.uid));
        const userData = userSnapshot.val();
        
        // Update UI with user data
        document.getElementById('userName').textContent = userData.fullName;
        document.getElementById('aimId').textContent = userData.aimId;
        document.getElementById('totalCredits').textContent = userData.totalCredits;
        
        // Load achievements
        loadAchievements();
        
        // Load credit history
        loadCreditHistory();
    } else {
        window.location.href = '../index.html';
    }
});

// Load user achievements
async function loadAchievements() {
    const achievementsQuery = query(
        ref(db, 'achievements'),
        orderByChild('userId'),
        equalTo(currentUser.uid),
        limitToLast(5)
    );
    
    onValue(achievementsQuery, (snapshot) => {
        const achievementsList = document.getElementById('achievementsList');
        achievementsList.innerHTML = '';
        
        const achievements = [];
        snapshot.forEach((childSnapshot) => {
            achievements.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        
        // Sort by createdAt in descending order
        achievements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        achievements.forEach(achievement => {
            const achievementCard = document.createElement('div');
            achievementCard.className = 'achievement-card';
            achievementCard.innerHTML = `
                <h5>${achievement.title}</h5>
                <p class="mb-1">${achievement.description}</p>
                <small class="text-muted">Credits: ${achievement.credits}</small>
            `;
            achievementsList.appendChild(achievementCard);
        });
    });
}

// Load credit history
async function loadCreditHistory() {
    const creditsQuery = query(
        ref(db, 'credits'),
        orderByChild('userId'),
        equalTo(currentUser.uid)
    );
    
    onValue(creditsQuery, (snapshot) => {
        const creditHistory = document.getElementById('creditHistory');
        creditHistory.innerHTML = '';
        
        const credits = [];
        snapshot.forEach((childSnapshot) => {
            credits.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        
        // Sort by createdAt in descending order
        credits.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        credits.forEach(credit => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatDate(credit.createdAt)}</td>
                <td>${credit.description}</td>
                <td>${credit.credits}</td>
                <td>${credit.institution}</td>
            `;
            creditHistory.appendChild(row);
        });
    });
}

// Format date
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Logout function
function logout() {
    auth.signOut().then(() => {
        window.location.href = '../index.html';
    }).catch(error => {
        alert('Error: ' + error.message);
    });
}
