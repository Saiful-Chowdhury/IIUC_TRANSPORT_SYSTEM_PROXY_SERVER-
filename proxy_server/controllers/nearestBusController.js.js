const axios = require('axios');
const NodeCache = require('node-cache'); // For caching
require('dotenv').config();

// Initialize in-memory cache with a TTL of 30 seconds
const cache = new NodeCache({ stdTTL: 30 });

// Fetch nearest buses from the VTS API or cache
const fetchNearestBusesFromVTS = async (userLat, userLon) => {
    const cacheKey = `nearest-bus:${userLat}:${userLon}`;
    try {
        // Check if data is cached
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            console.log(`Serving nearest buses for location ${userLat}, ${userLon} from cache`);
            return cachedData;
        }

        // Fetch data from the VTS API
       const payload = {
                  product :"VTS API",
                  version:"1.0",
                  apiName:"getNearestVehicleList",
                  apiSecretKey: process.env.SecretKey,
                  token: process.env.Token,
                  lat: userLat,
                  lon: userLon,
                  offset:0,
                  limit: 10,
              };

        const response = await axios.post(process.env.NearestBusUrl, payload, {
            headers: { 'Content-Type': 'text/plain' },
        });

        const data = response.data;
        if (!data || !data.response || !data.response.length) {
            throw new Error('Invalid or empty API response');
        }

        const vehicleData = data.response[0];
        if (!vehicleData.detailsOfVehicle || !Array.isArray(vehicleData.detailsOfVehicle)) {
            throw new Error('Missing or invalid detailsOfVehicle array');
        }

        const busLocations = vehicleData.detailsOfVehicle.map(vehicle => ({
            vehicleID: vehicle.vehId,
            latitude: vehicle.lat,
            longitude: vehicle.lon,
            speed: vehicle.speed || "N/A",
            distance: vehicle.distance || "N/A",
        }));

        // Cache the response
        cache.set(cacheKey, busLocations);
        console.log(`Fetched and cached nearest buses for location ${userLat}, ${userLon}`);
        return busLocations;
    } catch (error) {
        console.error(`Error fetching nearest buses for location ${userLat}, ${userLon}:`, error.message);
        return [];
    }
};

module.exports = { fetchNearestBusesFromVTS };









// const express = require('express');
// const axios = require('axios'); // For making HTTP requests to the proxy server
// const router = express.Router();

// // Proxy server URL (replace with your actual proxy server URL)
// const PROXY_SERVER_URL = process.env.PROXY_SERVER_URL || 'http://localhost:3000';

// // Route to fetch nearest buses via the proxy server
// router.get('/nearest-bus', async (req, res) => {
//     try {
//         // Extract and validate parameters
//         let { userLat, userLon } = req.query;
//         if (!userLat || !userLon || isNaN(userLat) || isNaN(userLon)) {
//             return res.status(400).json({ error: 'Invalid latitude or longitude parameters' });
//         }

//         // Convert to numbers
//         userLat = Number(userLat);
//         userLon = Number(userLon);

//         // Call the proxy server's nearest bus API
//         const proxyResponse = await axios.get(`${PROXY_SERVER_URL}/api/proxy/nearest-bus`, {
//             params: { userLat, userLon }, // Pass query parameters
//         });

//         // Extract data from the proxy server's response
//         const busLocations = proxyResponse.data;

//         if (!busLocations || busLocations.length === 0) {
//             return res.status(404).json({ error: 'No nearby buses found' });
//         }

//         // Log the full API response for debugging
//         console.log("Full API Response:", JSON.stringify(busLocations, null, 2));

//         // Send the response to the client
//         res.json(busLocations);
//     } catch (error) {
//         console.error('Error fetching nearest bus location:', error.message);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

// module.exports = router;