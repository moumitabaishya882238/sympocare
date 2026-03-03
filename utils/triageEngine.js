/**
 * Symptom Triage Engine
 * Classifies urgency based on specific logic rules.
 * STRICT: NO DIAGNOSIS. ONLY URGENCY.
 */

const triageLogic = {
    fever: (answers) => {
        const temp = parseFloat(answers.temperature);
        const duration = parseInt(answers.duration);
        const hasDifficultyBreathing = answers.difficultyBreathing === 'yes';
        const hasConfusion = answers.confusion === 'yes';

        if (hasDifficultyBreathing || hasConfusion || temp >= 104) {
            return {
                urgency: 'Emergency',
                reason: "Severe temperature or respiratory/neurological indicators detected.",
                advice: "Please seek immediate medical attention at the nearest emergency department or call emergency services.",
                disclaimer: "This system does not provide medical diagnosis. Seek professional medical care if symptoms worsen."
            };
        }

        if (temp >= 101 || duration >= 3) {
            return {
                urgency: 'Moderate',
                reason: "Persistent or high fever indicates a need for clinical evaluation.",
                advice: "Please consult with a healthcare professional soon for a personalized evaluation.",
                disclaimer: "This system does not provide medical diagnosis. Seek professional medical care if symptoms worsen."
            };
        }

        return {
            urgency: 'Normal',
            reason: "Symptoms appear stable based on reported data.",
            advice: "Continue to monitor your status, rest well, and stay hydrated. Contact a doctor if symptoms persist.",
            disclaimer: "This system does not provide medical diagnosis. Seek professional medical care if symptoms worsen."
        };
    },

    headache: (answers) => {
        const isSuddenSevere = answers.suddenSevere === 'yes';
        const hasVisionChanges = answers.visionChanges === 'yes';
        const duration = parseInt(answers.duration);

        if (isSuddenSevere || hasVisionChanges) {
            return {
                urgency: 'Emergency',
                reason: "Sudden onset of severe headache or vision changes are high-risk indicators.",
                advice: "Please go to the ER or call emergency services immediately.",
                disclaimer: "This system does not provide medical diagnosis. Seek professional medical care if symptoms worsen."
            };
        }

        if (duration >= 2) {
            return {
                urgency: 'Moderate',
                reason: "Persistent headache requires professional assessment.",
                advice: "Please schedule an appointment with a healthcare provider to discuss your symptoms.",
                disclaimer: "This system does not provide medical diagnosis. Seek professional medical care if symptoms worsen."
            };
        }

        return {
            urgency: 'Normal',
            reason: "Headache appears non-urgent based on current details.",
            advice: "Rest in a quiet, dark room and stay hydrated. Consult a doctor if it does not improve.",
            disclaimer: "This system does not provide medical diagnosis. Seek professional medical care if symptoms worsen."
        };
    },

    cough: (answers) => {
        const hasDifficultyBreathing = answers.difficultyBreathing === 'yes';
        const hasBlood = answers.coughingBlood === 'yes';
        const duration = parseInt(answers.duration);

        if (hasDifficultyBreathing || hasBlood) {
            return {
                urgency: 'Emergency',
                reason: "Respiratory distress or presence of blood requires immediate intervention.",
                advice: "Please seek immediate emergency medical care.",
                disclaimer: "This system does not provide medical diagnosis. Seek professional medical care if symptoms worsen."
            };
        }

        if (duration >= 10) {
            return {
                urgency: 'Moderate',
                reason: "Chronic cough requires clinical investigation.",
                advice: "A cough lasting more than 10 days should be evaluated by a healthcare professional.",
                disclaimer: "This system does not provide medical diagnosis. Seek professional medical care if symptoms worsen."
            };
        }

        return {
            urgency: 'Normal',
            reason: "Cough appears stable without immediate risk factors.",
            advice: "Stay hydrated and rest. If your cough worsens or you develop a high fever, consult a doctor.",
            disclaimer: "This system does not provide medical diagnosis. Seek professional medical care if symptoms worsen."
        };
    },

    chest_pain: (answers) => {
        const isCrushing = answers.crushingSensation === 'yes';
        const spreadsToArm = answers.spreadsToArm === 'yes';
        const isShortOfBreath = answers.shortOfBreath === 'yes';

        if (isCrushing || spreadsToArm || isShortOfBreath) {
            return {
                urgency: 'Emergency',
                reason: "Symptoms are highly indicative of a possible cardiac event.",
                advice: "Call emergency services (911/112) immediately. Do not drive yourself.",
                disclaimer: "This system does not provide medical diagnosis. Seek professional medical care if symptoms worsen."
            };
        }

        return {
            urgency: 'Moderate',
            reason: "Any chest pain warrants professional evaluation to ensure safety.",
            advice: "Please schedule an appointment today to discuss these symptoms with a doctor.",
            disclaimer: "This system does not provide medical diagnosis. Seek professional medical care if symptoms worsen."
        };
    },

    stomach_pain: (answers) => {
        const isSevere = answers.severePain === 'yes';
        const hasFever = answers.fever === 'yes';
        const location = answers.location;

        if (isSevere && location === 'lower-right') {
            return {
                urgency: 'Emergency',
                reason: "Severe pain in lower-right abdomen is a high-risk indicator.",
                advice: "Please seek immediate evaluation at an emergency room.",
                disclaimer: "This system does not provide medical diagnosis. Seek professional medical care if symptoms worsen."
            };
        }

        if (isSevere || hasFever) {
            return {
                urgency: 'Moderate',
                reason: "Severe or febrile stomach pain requires clinical review.",
                advice: "Please seek medical advice soon for a physical assessment.",
                disclaimer: "This system does not provide medical diagnosis. Seek professional medical care if symptoms worsen."
            };
        }

        return {
            urgency: 'Normal',
            reason: "Mild stomach symptoms without red flags.",
            advice: "Rest and monitor your symptoms. Stick to bland foods and stay hydrated. Consult a doctor if it persists.",
            disclaimer: "This system does not provide medical diagnosis. Seek professional medical care if symptoms worsen."
        };
    }
};

const { runTriageAI } = require('./gemini');

/**
 * Runs the triage logic for a specific symptom
 * @param {string} symptom 
 * @param {object} answers 
 * @returns {object} { urgency, suggestion }
 */
exports.runTriage = async (symptom, answers) => {
    const key = symptom.toLowerCase();
    if (triageLogic[key]) {
        return triageLogic[key](answers);
    }

    // FALLBACK TO AI
    return await runTriageAI(symptom, answers);
};
