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
    mood: {
        type: String,
        enum: ['Happy', 'Good', 'Okay', 'Tired', 'Sad', 'Anxious'],
        default: 'Okay',
    },
    feelingComparison: {
        type: String,
        enum: ['Better', 'Same', 'Worse'],
        default: 'Same',
    },
    sleepHours: {
        type: Number,
        default: 0,
    },
    sleepQuality: {
        type: String,
        enum: ['Excellent', 'Good', 'Fair', 'Poor'],
        default: 'Good',
    },
    waterIntake: {
        type: Number,
        default: 0,
    },
    foodDescription: {
        type: String,
    },
    fastFoodConsumed: {
        type: Boolean,
        default: false,
    },
    skippedMeals: {
        type: Boolean,
        default: false,
    },
    stressLevel: {
        type: String,
        enum: ['Low', 'Moderate', 'High'],
        default: 'Moderate',
    },
    feltTired: {
        type: Boolean,
        default: false,
    },
    physicalActivity: {
        type: Boolean,
        default: false,
    },
    sedentaryBehavior: {
        type: Boolean,
        default: false,
    },
    symptomsToday: [{
        type: String,
    }],
    experiencingPain: {
        type: Boolean,
        default: false,
    },
    painDescription: {
        type: String,
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
