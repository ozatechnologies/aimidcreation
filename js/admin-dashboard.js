// Check if user is admin
auth.onAuthStateChanged(async user => {
    if (user) {
        const userDoc = await usersRef.doc(user.uid).get();
        const userData = userDoc.data();
        
        if (userData.role !== 'admin') {
            window.location.href = '../user/dashboard.html';
        } else {
            // Load dashboard data
            loadDashboardStats();
            loadRecentActivity();
        }
    } else {
        window.location.href = '../index.html';
    }
});

// Load dashboard statistics
async function loadDashboardStats() {
    // Get total users
    const usersSnapshot = await usersRef.where('role', '==', 'user').get();
    document.getElementById('totalUsers').textContent = usersSnapshot.size;
    
    // Get total credits awarded
    let totalCredits = 0;
    const creditsSnapshot = await creditsRef.get();
    creditsSnapshot.forEach(doc => {
        totalCredits += doc.data().credits;
    });
    document.getElementById('totalCredits').textContent = totalCredits;
    
    // Get unique institutions
    const institutions = new Set();
    creditsSnapshot.forEach(doc => {
        institutions.add(doc.data().institution);
    });
    document.getElementById('totalInstitutions').textContent = institutions.size;
}

// Load recent activity
async function loadRecentActivity() {
    const activitySnapshot = await creditsRef
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get();
    
    const recentActivity = document.getElementById('recentActivity');
    recentActivity.innerHTML = '';
    
    activitySnapshot.forEach(doc => {
        const activity = doc.data();
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(activity.createdAt.toDate())}</td>
            <td>${activity.aimId}</td>
            <td>Credit Assignment</td>
            <td>${activity.credits}</td>
            <td>${activity.institution}</td>
        `;
        recentActivity.appendChild(row);
    });
}

// Handle credit assignment
document.getElementById('creditForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const aimId = document.getElementById('aimId').value;
    const credits = Number(document.getElementById('credits').value);
    const description = document.getElementById('description').value;
    const institution = document.getElementById('institution').value;
    
    try {
        // Find user by AIM ID
        const userSnapshot = await usersRef.where('aimId', '==', aimId).get();
        
        if (userSnapshot.empty) {
            alert('User not found with this AIM ID');
            return;
        }
        
        const userData = userSnapshot.docs[0].data();
        const userId = userSnapshot.docs[0].id;
        
        // Create credit record
        await creditsRef.add({
            userId: userId,
            aimId: aimId,
            credits: credits,
            description: description,
            institution: institution,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Update user's total credits
        await usersRef.doc(userId).update({
            totalCredits: userData.totalCredits + credits
        });
        
        // Clear form and reload data
        e.target.reset();
        loadDashboardStats();
        loadRecentActivity();
        
        alert('Credits assigned successfully!');
    } catch (error) {
        alert('Error: ' + error.message);
    }
});

// Format date
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
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
