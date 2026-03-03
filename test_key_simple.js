const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
const fs = require('fs');
dotenv.config();

function logToFile(msg) {
    fs.appendFileSync('debug_lib_output.txt', msg + '\n');
    console.log(msg);
}

fs.writeFileSync('debug_lib_output.txt', '--- START MODEL LIST TEST ---\n');

async function listModels() {
    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // The SDK doesn't have a direct listModels on genAI in this version usually, 
        // but we can try to fetch it if available or use a different method.
        // Actually, the simplest is to try gemini-1.5-flash-001
        logToFile("Attempting call with gemini-1.5-flash-001...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });
        const result = await model.generateContent("Hi");
        logToFile("SUCCESS gemini-1.5-flash-001: " + result.response.text());
    } catch (error) {
        logToFile("FAILURE gemini-1.5-flash-001: " + error.message);
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        logToFile("Attempting call with gemini-2.0-flash-exp...");
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        const result = await model.generateContent("Hi");
        logToFile("SUCCESS gemini-2.0-flash-exp: " + result.response.text());
    } catch (error) {
        logToFile("FAILURE gemini-2.0-flash-exp: " + error.message);
    }
}

listModels();
