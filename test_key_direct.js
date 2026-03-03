const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

async function testKey() {
    const key = process.env.GEMINI_API_KEY;
    console.log(`Testing key: ${key.substring(0, 5)}...${key.substring(key.length - 5)}`);

    const genAI = new GoogleGenerativeAI(key);
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Say 'Hello'");
        console.log("Response:", result.response.text());
        console.log("✅ Key is VALID!");
    } catch (err) {
        console.error("❌ Key is INVALID or Error occurred:");
        console.error(err.message);
    }
}

testKey();
