const mongoose = require('mongoose');

const dailyLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    meals: [
        {
            foodName: {
                type: String,
                required: [true, 'Please add a food name'],
            },
            category: {
                type: String,
                enum: ['Healthy', 'Moderate', 'Unhealthy', 'Unknown'],
                default: 'Unknown',
            },
        },
    ],
    waterIntake: {
        type: Number, // in cups or ml
        default: 0,
    },
    sleepHours: {
        type: Number,
        default: 0,
    },
    mood: {
        type: String,
        enum: ['Happy', 'Good', 'Okay', 'Tired', 'Sad', 'Anxious'],
        default: 'Okay',
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot be more than 500 characters'],
    },
    dailyScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
});

// Create index for user and date to quickly fetch daily logs
dailyLogSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('DailyLog', dailyLogSchema);
