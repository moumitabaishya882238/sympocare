const mongoose = require('mongoose');

const symptomLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    symptomName: {
        type: String,
        required: [true, 'Please specify the symptom'],
    },
    answers: {
        type: Map,
        of: String,
    },
    urgency: {
        type: String,
        enum: ['Normal', 'Moderate', 'Emergency'],
        required: true,
    },
    reason: {
        type: String,
    },
    advice: {
        type: String,
    },
    disclaimer: {
        type: String,
    },
    suggestion: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('SymptomLog', symptomLogSchema);
