const dotenv = require('dotenv');
dotenv.config();

const { categorizeFood } = require('./utils/foodEngine');
const { runTriage } = require('./utils/triageEngine');

async function runTests() {
    console.log('--- Gemini AI Integration Test ---');

    // 1. Test obscure food (should trigger AI)
    console.log('\n[1] Testing AI Food Categorization...');
    const food = "Keto-friendly zucchini noodles with avocado oil and flaxseeds";
    const category = await categorizeFood(food);
    console.log(`Food: "${food}"`);
    console.log(`Result: ${category}`);
    if (['Healthy', 'Moderate', 'Unhealthy'].includes(category)) {
        console.log('✅ PASS: AI Categorized successfully.');
    } else {
        console.log('❌ FAIL: AI categorization returned Unknown or failed.');
    }

    // 2. Test obscure symptom (should trigger AI)
    console.log('\n[2] Testing AI Symptom Triage...');
    const symptom = "Blurry vision in one eye after reading for 5 minutes";
    const answers = { duration: "2 days", severe: "no" };
    const triageResult = await runTriage(symptom, answers);
    console.log(`Symptom: "${symptom}"`);
    console.log(`Result: Urgency=${triageResult.urgency}, Suggestion="${triageResult.suggestion}"`);
    if (triageResult.urgency && triageResult.suggestion) {
        console.log('✅ PASS: AI Triage successful.');
    } else {
        console.log('❌ FAIL: AI triage failed.');
    }

    console.log('\nTests completed.');
}

runTests().catch(console.error);
