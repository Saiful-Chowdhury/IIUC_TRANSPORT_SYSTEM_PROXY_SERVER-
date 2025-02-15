const express = require('express');
const router = express.Router();
const { fetchBusLocationFromVTS } = require('../controllers/liveTrackController');

// Route to fetch bus location
router.get('/bus-location/:id', async (req, res) => {
    const vehicleID = req.params.id;

    if (!vehicleID) {
        return res.status(400).json({ error: 'Invalid vehicle ID' });
    }

    try {
        const location = await fetchBusLocationFromVTS(vehicleID);

        if (!location) {
            return res.status(404).json({ error: 'Location not found' });
        }

        res.json(location);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;