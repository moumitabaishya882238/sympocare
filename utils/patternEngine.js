/**
 * Pattern Detection Engine
 * Analyzes logs for trends and generates supportive suggestions.
 */

exports.detectPatterns = (logs) => {
    if (!logs || logs.length === 0) {
        return {
            message: "Start logging your daily status to see weekly health patterns!",
            type: 'neutral'
        };
    }

    let totalSleep = 0;
    let totalWater = 0;
    let unhealthyCount = 0;
    let healthyCount = 0;
    let lowMoodDays = 0;

    logs.forEach(log => {
        totalSleep += log.sleepHours || 0;
        totalWater += log.waterIntake || 0;

        log.meals.forEach(meal => {
            if (meal.category === 'Unhealthy') unhealthyCount++;
            if (meal.category === 'Healthy') healthyCount++;
        });

        if (['Bad', 'Terrible'].includes(log.mood)) {
            lowMoodDays++;
        }
    });

    const avgSleep = totalSleep / logs.length;
    const avgWater = totalWater / logs.length;

    // Pattern Logic & Suggestions
    if (unhealthyCount > healthyCount * 2 && unhealthyCount > 3) {
        return {
            message: "We've noticed a few more indulgence meals lately. Try adding a colorful salad or some fruit to your next meal to feel more energized!",
            type: 'lifestyle'
        };
    }

    if (avgSleep < 6) {
        return {
            message: "It looks like you've been getting less sleep than usual. A consistent sleep schedule can really help improve your mood and focus.",
            type: 'sleep'
        };
    }

    if (avgWater < 5) {
        return {
            message: "Staying hydrated is key! You're a bit below the recommended water intake. Maybe keep a water bottle nearby today?",
            type: 'hydration'
        };
    }

    if (lowMoodDays >= 3) {
        return {
            message: "You've had a few tough days lately. Remember to take a small break for yourself today—even a 5-minute walk can help.",
            type: 'mood'
        };
    }

    if (healthyCount > unhealthyCount && logs.length >= 3) {
        return {
            message: "Great job! Your current habits show a strong commitment to healthy choices. Keep up this wonderful momentum!",
            type: 'positive'
        };
    }

    return {
        message: "You're doing great by staying consistent with your logs. Keeping track is the first step to better health awareness.",
        type: 'neutral'
    };
};
