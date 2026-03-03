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
            meals = await Promise.all(meals.map(async (meal) => ({
                ...meal,
                category: await categorizeFood(meal.foodName)
            })));
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

// @desc    Get dashboard summary
// @route   GET /api/logs/summary
// @access  Private
router.get('/summary', protect, async (req, res) => {
    try {
        const SymptomLog = require('../models/SymptomLog');

        // 1. Get today's log
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const todayLog = await DailyLog.findOne({
            user: req.user.id,
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        // 2. Get 7-day logs for trend analysis
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const weeklyLogs = await DailyLog.find({
            user: req.user.id,
            date: { $gte: sevenDaysAgo }
        }).sort('-date');

        // 3. Get recent triage history
        const recentTriage = await SymptomLog.find({ user: req.user.id })
            .sort('-date')
            .limit(3);

        const analysis = detectPatterns(weeklyLogs);

        res.status(200).json({
            success: true,
            data: {
                today: todayLog || { dailyScore: 0, meals: [], waterIntake: 0, sleepHours: 0, mood: 'Okay' },
                analysis,
                recentTriage,
                weeklyStats: weeklyLogs.length
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// @desc    Get 14-day stats for trends
// @route   GET /api/logs/stats/trends
// @access  Private
router.get('/stats/trends', protect, async (req, res) => {
    try {
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
        fourteenDaysAgo.setHours(0, 0, 0, 0);

        const logs = await DailyLog.find({
            user: req.user.id,
            date: { $gte: fourteenDaysAgo }
        }).sort('date');

        // Create a map of existing logs for easy lookup
        const logMap = {};
        logs.forEach(log => {
            const dateStr = log.date.toISOString().split('T')[0];
            logMap[dateStr] = log;
        });

        // Generate full 14-day sequence to avoid gaps in charts
        const trendData = [];
        for (let i = 0; i < 14; i++) {
            const d = new Date();
            d.setDate(d.getDate() - (13 - i)); // From 13 days ago to today
            const dateStr = d.toISOString().split('T')[0];

            if (logMap[dateStr]) {
                trendData.push({
                    date: dateStr,
                    score: logMap[dateStr].dailyScore,
                    sleep: logMap[dateStr].sleepHours,
                    water: logMap[dateStr].waterIntake,
                    mood: logMap[dateStr].mood
                });
            } else {
                trendData.push({
                    date: dateStr,
                    score: 0,
                    sleep: 0,
                    water: 0,
                    mood: 'None'
                });
            }
        }

        res.status(200).json({
            success: true,
            data: trendData
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

module.exports = router;
