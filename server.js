const express = require('express');
const cors = require('cors');
const { getUserProfile, saveUserProfile, addToWatchHistory } = require('./database');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Get user profile
app.get('/api/profile/:userId', (req, res) => {
    const profile = getUserProfile(req.params.userId);
    if (profile) {
        res.json(profile);
    } else {
        res.status(404).json({ error: 'Profile not found' });
    }
});

// Save user profile
app.post('/api/profile/:userId', (req, res) => {
    const success = saveUserProfile(req.params.userId, req.body);
    if (success) {
        res.json({ message: 'Profile saved successfully' });
    } else {
        res.status(500).json({ error: 'Failed to save profile' });
    }
});

// Add to watch history
app.post('/api/profile/:userId/watch-history', (req, res) => {
    const success = addToWatchHistory(req.params.userId, req.body);
    if (success) {
        res.json({ message: 'Added to watch history' });
    } else {
        res.status(500).json({ error: 'Failed to add to watch history' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 