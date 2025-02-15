const axios = require('axios');
const NodeCache = require('node-cache'); // Import node-cache
require('dotenv').config();

// Initialize in-memory cache with a TTL of 5 seconds
const cache = new NodeCache({ stdTTL: 5 });

// Helper function to calculate distance between two points (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Fetch bus location from the VTS API or in-memory cache
const fetchBusLocationFromVTS = async (vehicleID) => {
    const cacheKey = `bus-location:${vehicleID}`;
    try {
        // Check if data is cached in memory
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            console.log(`Serving data for vehicle ${vehicleID} from in-memory cache`);
            return cachedData; // Return cached data directly
        }

        // If not cached, fetch data from the VTS API
        const payload = {
            product: "VTS API",
            version: "1.0",
            apiName: "getVehicleLocation",
            apiSecretKey: process.env.SecretKey,
            token: process.env.Token,
            vehicleID: vehicleID,
        };

        const response = await axios.post(process.env.SingleTrackurl, payload, {
            headers: { 'Content-Type': 'text/plain' },
        });

        const data = response.data;
        const vehicleLocation = data?.response?.[0]?.detailsOfLocation?.[0];

        if (!vehicleLocation) {
            throw new Error('Location data not found');
        }

      

        // Check if cached data exists and compare distances
        if (cachedData) {
            const distance = calculateDistance(
                cachedData.latitude,
                cachedData.longitude,
                location.latitude,
                location.longitude
            );
            if (distance < 0.01) { // Threshold: 10 meters
                console.log(`Cached data is still valid for vehicle ${vehicleID}`);
                return cachedData; // Serve cached data if the location hasn't changed significantly
            }
        }

        const location = {
            vehicleID,
            latitude: vehicleLocation.lat,
            longitude: vehicleLocation.lon,
          
        };

        // Cache the new data in memory
        cache.set(cacheKey, location);
        console.log(`Fetched and cached data for vehicle ${vehicleID}`);



        return location;
    } catch (error) {
        console.error(`Error fetching data for vehicle ${vehicleID}:`, error.message);
        return null;
    }
};

module.exports = { fetchBusLocationFromVTS };

