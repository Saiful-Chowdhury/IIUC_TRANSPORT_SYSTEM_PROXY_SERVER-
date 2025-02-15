const express = require('express');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PROXY_PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Import routes
const liveLocationRoutes = require('./routes/liveTrackOne');
const nearestBusRoutes = require('./routes/nearestBuses');

// Use routes
app.use('/api/proxy', liveLocationRoutes);
app.use('/api/proxy', nearestBusRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});