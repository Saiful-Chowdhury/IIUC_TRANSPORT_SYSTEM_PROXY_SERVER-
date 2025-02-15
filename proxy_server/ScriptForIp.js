const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config(); // Load environment variables


const fetchNearestBusesFromVTS = async () => {
    try {
        // Fetch data from the VTS API
       const payload = {
                 product:"VTS API",
                version:"1.0",
                apiName:"iptrace",
                apiSecretKey: process.env.SecretKey,
                username: process.env.userNameIp,
                password: process.env.password,
              };

        const response = await axios.post(process.env.IpBusUrl, payload, {
            headers: { 'Content-Type': 'text/plain' },
        });

        const data = response.data;
        console.log(data);  
    } catch (error) {
        console.error(`Error fetching nearest buses for location`, error.message);
        return [];
    }

};

fetchNearestBusesFromVTS();
