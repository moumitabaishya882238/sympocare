const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Common AI handler for structured responses
 * @param {string} prompt 
 * @returns {string} Cleaned response text
 */
async function getAIResponse(prompt) {
    const apiKey = (process.env.GEMINI_API_KEY || '').trim();

    if (!apiKey || apiKey === 'your_key_here') {
        console.warn('Gemini API key missing. Falling back to local logic.');
        return null;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        console.error('Gemini AI Error:', error.message);
        return null;
    }
}

/**
 * Use AI to categorize food when keywords fail
 * @param {string} foodName 
 * @returns {string} 'Healthy', 'Moderate', 'Unhealthy', or 'Unknown'
 */
exports.categorizeFoodAI = async (foodName) => {
    const prompt = `Categorize the following food into exactly one of these categories: Healthy, Moderate, Unhealthy. 
    Food Name: "${foodName}". 
    Response format: JUST THE CATEGORY NAME.`;

    const response = await getAIResponse(prompt);

    if (['Healthy', 'Moderate', 'Unhealthy'].includes(response)) {
        return response;
    }

    return 'Unknown';
};

/**
 * Use AI for symptom triage when specific logic is missing
 * @param {string} symptom 
 * @param {object} answers 
 * @returns {object} { urgency, suggestion }
 */
exports.runTriageAI = async (symptom, answers) => {
    const prompt = `You are a clinical triage assistant inside a structured digital health system.

Your role is NOT to diagnose disease.
Your role is NOT to prescribe medication.
Your role is ONLY to classify urgency level and provide general guidance.

You must strictly follow these rules:
Only classify into one of these three categories:
Normal
Moderate
Emergency

Do NOT mention specific diseases.
Do NOT confirm any diagnosis.
Do NOT provide medicine dosage.
Keep responses short and structured.
Use calm and supportive language.
Always include a medical disclaimer.

You will receive structured symptom data in JSON format.

{
"symptom": "${symptom}",
${Object.entries(answers).map(([key, val]) => `"${key}": "${val}"`).join(',\n')}
}

Based on the input:
Evaluate overall risk.
Consider severity indicators.
Consider duration.
Consider existing medical conditions as risk modifiers.

Return response ONLY in this JSON format:
{
"urgency": "Normal | Moderate | Emergency",
"reason": "Short explanation of risk factors",
"advice": "Clear next step guidance",
"disclaimer": "This system does not provide medical diagnosis. Seek professional medical care if symptoms worsen."
}

Do NOT return anything outside JSON.
Do NOT include extra commentary.
Do NOT include markdown formatting.
Do NOT diagnose.`;

    const response = await getAIResponse(prompt);

    try {
        // Clean markdown if AI returns it (like ```json ... ```)
        const cleanJson = response.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanJson);
    } catch (e) {
        console.error('Failed to parse AI triage response:', response);
        return {
            urgency: 'Moderate',
            reason: "The system was unable to fully analyze these specific symptoms automatically.",
            advice: "We recommend consulting a healthcare professional for personalized guidance on this symptom.",
            disclaimer: "This system does not provide medical diagnosis. Seek professional medical care if symptoms worsen."
        };
    }
};
