// Profile management
let userProfile = {
    username: '',
    email: '',
    favoriteGenres: [],
    watchHistory: [],
    profileImage: null
};

const USER_ID = 'user1'; // In a real app, this would come from authentication

// Load profile data when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    setupAvatarUpload();
});

function setupAvatarUpload() {
    const avatarInput = document.getElementById('avatarInput');
    const profileImage = document.getElementById('profileImage');

    avatarInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                profileImage.src = e.target.result;
                userProfile.profileImage = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
}

function loadProfile() {
    try {
        const savedProfile = localStorage.getItem(`userProfile_${USER_ID}`);
        if (savedProfile) {
            userProfile = JSON.parse(savedProfile);
            
            // Update UI with saved data
            document.getElementById('username').value = userProfile.username || '';
            document.getElementById('email').value = userProfile.email || '';
            
            if (userProfile.profileImage) {
                document.getElementById('profileImage').src = userProfile.profileImage;
            }

            // Restore favorite genres
            const genreButtons = document.querySelectorAll('#profileGenreList .genre-btn');
            genreButtons.forEach(button => {
                if (userProfile.favoriteGenres && userProfile.favoriteGenres.includes(button.textContent)) {
                    button.classList.add('selected');
                }
            });

            // Load watch history
            displayWatchHistory();
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

function saveProfile() {
    try {
        // Get current values
        userProfile.username = document.getElementById('username').value;
        userProfile.email = document.getElementById('email').value;
        
        // Get selected genres
        userProfile.favoriteGenres = Array.from(document.querySelectorAll('#profileGenreList .genre-btn.selected'))
            .map(button => button.textContent);

        // Save to localStorage
        localStorage.setItem(`userProfile_${USER_ID}`, JSON.stringify(userProfile));
        
        alert('Profile saved successfully!');
    } catch (error) {
        console.error('Error saving profile:', error);
        alert('Error saving profile. Please try again.');
    }
}

function displayWatchHistory() {
    const watchHistoryDiv = document.getElementById('watchHistory');
    watchHistoryDiv.innerHTML = '';

    if (!userProfile.watchHistory || userProfile.watchHistory.length === 0) {
        watchHistoryDiv.innerHTML = '<p>No watch history yet.</p>';
        return;
    }

    userProfile.watchHistory.forEach(movie => {
        const movieElement = document.createElement('div');
        movieElement.className = 'result-item';
        movieElement.innerHTML = `
            <div class="movie-content">
                <h3>${movie.title}</h3>
                <p>Watched on: ${new Date(movie.watchedDate).toLocaleDateString()}</p>
                <p>Rating: ${(movie.rating / 2).toFixed(1)}/5</p>
            </div>
            ${movie.poster_path ? `<img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title} poster">` : ''}
        `;
        watchHistoryDiv.appendChild(movieElement);
    });
}

// Function to add a movie to watch history (called from movie-finder.js)
function addToWatchHistory(movie) {
    if (!userProfile.watchHistory) {
        userProfile.watchHistory = [];
    }

    // Check if movie already exists in history
    const existingIndex = userProfile.watchHistory.findIndex(m => m.id === movie.id);
    if (existingIndex !== -1) {
        // Update existing entry
        userProfile.watchHistory[existingIndex].watchedDate = new Date().toISOString();
    } else {
        // Add new entry
        userProfile.watchHistory.unshift({
            id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            rating: movie.vote_average,
            watchedDate: new Date().toISOString()
        });
    }

    // Keep only last 20 movies
    if (userProfile.watchHistory.length > 20) {
        userProfile.watchHistory = userProfile.watchHistory.slice(0, 20);
    }

    // Save updated profile
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
}

// Make toggleGenre available globally
window.toggleGenre = function(button) {
    button.classList.toggle('selected');
}; 