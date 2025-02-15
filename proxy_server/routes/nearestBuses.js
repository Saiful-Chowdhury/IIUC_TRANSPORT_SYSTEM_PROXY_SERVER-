const express = require('express');
const router = express.Router();
const { fetchNearestBusesFromVTS } = require('../controllers/nearestBusController.js');

// Route to fetch nearest buses
router.get('/nearest-bus', async (req, res) => {
    let { userLat, userLon } = req.query;

    if (!userLat || !userLon || isNaN(userLat) || isNaN(userLon)) {
        return res.status(400).json({ error: 'Invalid latitude or longitude parameters' });
    }

    userLat = Number(userLat);
    userLon = Number(userLon);

    try {
        const buses = await fetchNearestBusesFromVTS(userLat, userLon);

        if (!buses || buses.length === 0) {
            return res.status(404).json({ error: 'No nearby buses found' });
        }

        res.json(buses);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;