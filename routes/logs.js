const express = require('express');
const DailyLog = require('../models/DailyLog');
const { protect } = require('../middleware/auth');
const { categorizeFood, calculateDailyScore } = require('../utils/foodEngine');
const { detectPatterns } = require('../utils/patternEngine');
const router = express.Router();

// @desc    Create or update daily log
// @route   POST /api/logs
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        let { meals, waterIntake, sleepHours, mood, notes } = req.body;

        // Automatically categorize each meal
        if (meals && Array.isArray(meals)) {
            meals = meals.map(meal => ({
                ...meal,
                category: categorizeFood(meal.foodName)
            }));
        }

        // Calculate score
        const dailyScore = calculateDailyScore(meals);

        // Check if a log already exists for today for this user
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        let log = await DailyLog.findOne({
            user: req.user.id,
            date: { $gte: startOfDay, $lte: endOfDay },
        });

        if (log) {
            // Update existing log
            log.meals = meals || log.meals;
            log.waterIntake = waterIntake !== undefined ? waterIntake : log.waterIntake;
            log.sleepHours = sleepHours !== undefined ? sleepHours : log.sleepHours;
            log.mood = mood || log.mood;
            log.notes = notes || log.notes;
            log.dailyScore = dailyScore;
            await log.save();
        } else {
            // Create new log
            log = await DailyLog.create({
                user: req.user.id,
                meals,
                waterIntake,
                sleepHours,
                mood,
                notes,
                dailyScore
            });
        }

        res.status(200).json({ success: true, data: log });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// @desc    Get all logs for the current user
// @route   GET /api/logs
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const logs = await DailyLog.find({ user: req.user.id }).sort('-date');
        res.status(200).json({ success: true, count: logs.length, data: logs });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// @desc    Get today's log for the current user
// @route   GET /api/logs/today
// @access  Private
router.get('/today', protect, async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const log = await DailyLog.findOne({
            user: req.user.id,
            date: { $gte: startOfDay, $lte: endOfDay },
        });

        res.status(200).json({ success: true, data: log || {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// @desc    Get 7-day analysis
// @route   GET /api/logs/analysis
// @access  Private
router.get('/analysis', protect, async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const logs = await DailyLog.find({
            user: req.user.id,
            date: { $gte: sevenDaysAgo }
        }).sort('date');

        const analysis = detectPatterns(logs);

        res.status(200).json({
            success: true,
            count: logs.length,
            data: analysis
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

module.exports = router;
