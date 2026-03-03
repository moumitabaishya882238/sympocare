const axios = require('axios');
require('dotenv').config();

const testTrends = async () => {
    try {
        // Need a token - for testing we'll assume a local dev environment
        // or we can test the logic directly if we import the route, 
        // but let's try a simple network request first if possible.

        console.log('Testing /api/logs/stats/trends...');
        const res = await axios.get('http://localhost:5000/api/logs/stats/trends');
        console.log('Response:', res.data);
    } catch (err) {
        console.log('Expected failure (no auth):', err.response?.status || err.message);
    }
};

testTrends();
