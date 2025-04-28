import React, { useState } from 'react';
import './fitness.css';  // Import the updated CSS file

const FitnessAI = () => {
    const [fitnessResult, setFitnessResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [aiStarted, setAiStarted] = useState(false);  // New state to track if AI has started

    const startFitnessAI = async () => {
        setLoading(true);
        setAiStarted(true); // Set AI started notification

        try {
            // Simulating a fetch request to start fitness AI (in real-world use, this should interact with your backend or AI process)
            const response = await fetch('http://localhost:3001/start-fitness', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();
            setFitnessResult(result);
        } catch (error) {
            console.error('Error starting Fitness AI:', error);
        } finally {
            setLoading(false); // Reset loading state once the process is finished
        }
    };

    return (
        <div className="fitness-ai-container">
            <h2>Fitness AI</h2>
            <button onClick={startFitnessAI} disabled={loading}>
                {loading ? 'Loading...' : 'Start Fitness AI'}
            </button>

            {/* Show notification when AI starts */}
            {aiStarted && !loading && (
                <div className="notification">
                    <h4>AI Started, Camera Capturing...</h4>
                </div>
            )}

            {fitnessResult && (
                <div>
                    <h3>Fitness AI Result:</h3>
                    <pre>{JSON.stringify(fitnessResult, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default FitnessAI;
