const express = require('express');
const { spawn } = require('child_process');
const app = express();
const path = require('path');
const cors = require('cors');

// Use CORS if necessary
app.use(cors({
  origin: '*',  // Allow requests from any origin (you can restrict it later)
}));

app.use(express.json());

// Route to serve the Fitness AI functionality
app.post('/start-fitness', (req, res) => {
    const pythonProcess = spawn('python', ['fitness_ai.py']);  // Run the Python script

    pythonProcess.stdout.on('data', (data) => {
        const result = JSON.parse(data.toString());  // Parse the JSON result from the Python script
        res.json(result);  // Send the result back to the frontend
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error('Error:', data.toString());
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`);
    });
});

// Start the server
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
