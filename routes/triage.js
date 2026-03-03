const express = require('express');
const SymptomLog = require('../models/SymptomLog');
const { protect } = require('../middleware/auth');
const { runTriage } = require('../utils/triageEngine');
const router = express.Router();

// @desc    Perform triage and save result
// @route   POST /api/triage
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { symptomName, answers } = req.body;

        if (!symptomName || !answers) {
            return res.status(400).json({ success: false, error: 'Symptom name and answers are required' });
        }

        // Run Logic
        const result = await runTriage(symptomName, answers);

        // Save to DB
        const log = await SymptomLog.create({
            user: req.user.id,
            symptomName,
            answers,
            urgency: result.urgency,
            reason: result.reason,
            advice: result.advice,
            disclaimer: result.disclaimer,
            suggestion: result.advice // For backward compatibility
        });

        res.status(201).json({
            success: true,
            data: log
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// @desc    Get triage history
// @route   GET /api/triage
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const history = await SymptomLog.find({ user: req.user.id }).sort('-date');
        res.status(200).json({ success: true, count: history.length, data: history });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

module.exports = router;
