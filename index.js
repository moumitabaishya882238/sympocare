const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

// Load env vars
dotenv.config();

// Connect to database
console.log('Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sympocare')
    .then(() => console.log('✅ MongoDB Connected...'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
        if (err.message.includes('buffering timed out')) {
            console.log('Tip: Check your Atlas Network Access (IP Whitelist).');
        }
    });

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Route files
const auth = require('./routes/auth');
const logs = require('./routes/logs');

// Mount routers
app.use('/api/auth', auth);
app.use('/api/logs', logs);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(`Error: ${err.message}`);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Server Error'
    });
});

app.get('/', (req, res) => {
    res.send('SympoCare API is running...');
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // server.close(() => process.exit(1));
});
