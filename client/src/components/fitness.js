import React, { useState } from 'react';

const FitnessAI = () => {
    const [fitnessResult, setFitnessResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const startFitnessAI = async () => {
        setLoading(true);

        try {
            const response = await fetch('http://localhost:3001/start-fitness', {  // Ensure the correct API URL
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
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Fitness AI</h2>
            <button onClick={startFitnessAI} disabled={loading}>
                {loading ? 'Loading...' : 'Start Fitness AI'}
            </button>

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
