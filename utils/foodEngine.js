/**
 * Simple keyword-based food categorization engine
 */

const foodKeywords = {
    healthy: [
        'salad', 'oatmeal', 'fruit', 'vegetable', 'apple', 'banana', 'broccoli',
        'chicken breast', 'fish', 'salmon', 'quinoa', 'brown rice', 'eggs',
        'spinach', 'kale', 'nuts', 'almonds', 'yogurt', 'water', 'smoothie'
    ],
    unhealthy: [
        'burger', 'pizza', 'fries', 'soda', 'coke', 'pepsi', 'cake', 'cookie',
        'donut', 'fried', 'ice cream', 'candy', 'chocolate', 'chips', 'beer',
        'alcohol', 'white bread', 'syrup', 'hot dog', 'bacon'
    ],
    moderate: [
        'pasta', 'beef', 'steak', 'sandwich', 'cheese', 'milk', 'juice',
        'potato', 'rice', 'honey', 'butter', 'pork'
    ]
};

/**
 * Categorizes a food name based on keywords
 * @param {string} foodName 
 * @returns {string} Category: Healthy, Moderate, Unhealthy, or Unknown
 */
exports.categorizeFood = (foodName) => {
    if (!foodName) return 'Unknown';

    const name = foodName.toLowerCase();

    // Check Unhealthy first (often more specific keywords)
    if (foodKeywords.unhealthy.some(keyword => name.includes(keyword))) {
        return 'Unhealthy';
    }

    // Check Healthy
    if (foodKeywords.healthy.some(keyword => name.includes(keyword))) {
        return 'Healthy';
    }

    // Check Moderate
    if (foodKeywords.moderate.some(keyword => name.includes(keyword))) {
        return 'Moderate';
    }

    return 'Unknown';
};

/**
 * Calculates a health score based on meal categories
 * @param {Array} meals 
 * @returns {number} Score from 0 to 100
 */
exports.calculateDailyScore = (meals) => {
    if (!meals || meals.length === 0) return 0;

    let totalPoints = 0;
    meals.forEach(meal => {
        if (meal.category === 'Healthy') totalPoints += 10;
        else if (meal.category === 'Moderate') totalPoints += 5;
        else if (meal.category === 'Unhealthy') totalPoints -= 5;
    });

    // Normalize score between 0 and 100
    const maxPossible = meals.length * 10;
    if (maxPossible <= 0) return 0;

    let score = (totalPoints / maxPossible) * 100;
    return Math.max(0, Math.min(100, Math.round(score)));
};
