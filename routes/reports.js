const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const DailyLog = require('../models/DailyLog');
const { generateHealthReport } = require('../utils/reportService');

// @desc    Download health report PDF
// @route   GET /api/reports/download
// @access  Private
router.get('/download', protect, async (req, res) => {
    try {
        // Fetch all logs for this user, sorted by date descending
        const logs = await DailyLog.find({ user: req.user.id }).sort('-date');

        if (!logs || logs.length === 0) {
            return res.status(404).json({ success: false, error: 'No health logs found to generate a report.' });
        }

        const pdfBuffer = await generateHealthReport(req.user, logs);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=SympoCare_Report_${new Date().toISOString().split('T')[0]}.pdf`,
            'Content-Length': pdfBuffer.length
        });

        res.send(pdfBuffer);
    } catch (err) {
        console.error('PDF Generation Error:', err);
        res.status(500).json({ success: false, error: 'Failed to generate report.' });
    }
});

module.exports = router;
