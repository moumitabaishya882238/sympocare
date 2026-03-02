const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

console.log('--- MongoDB Atlas Diagnostic ---');
console.log('URI:', process.env.MONGO_URI ? 'Detected' : 'NOT FOUND');

if (!process.env.MONGO_URI) {
    console.error('Error: MONGO_URI is missing in .env file');
    process.exit(1);
}

console.log('Connecting to Atlas...');

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ SUCCESS: Connected to MongoDB Atlas!');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ FAILURE: Connection failed.');
        console.error('Error Name:', err.name);
        console.error('Error Message:', err.message);

        if (err.message.includes('MongooseServerSelectionError')) {
            console.log('\nPossible causes:');
            console.log('1. Your IP address is not whitelisted in MongoDB Atlas.');
            console.log('2. Your network/firewall is blocking port 27017.');
            console.log('3. The username or password in MONGO_URI is incorrect.');
        }
        process.exit(1);
    });
