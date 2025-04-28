const express = require('express');
const path = require('path');
const cors = require('cors');  // Import the cors module
const { spawn } = require('child_process'); // This allows you to run Python scripts
const app = express();
const port = 3001;

// Enable CORS for requests from all origins or specify the allowed origins
app.use(cors());  // This enables CORS for all routes

// Serve static files (like JS, CSS)
app.use(express.static(path.join(__dirname, 'public')));

// Home route (serving index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Fitness AI route (serving the fitness AI page)
app.get('/fitness', (req, res) => {
    res.sendFile(path.join(__dirname, 'fitness.html'));
});

app.post('/start-fitness', (req, res) => {
    const pythonProcess = spawn('python', ['fitness_ai.py']); // Run the Python script

    pythonProcess.stdout.on('data', (data) => {
        // Convert buffer to string and parse JSON
        const result = JSON.parse(data.toString());
        console.log(result);

        // Send the result back to the client
        res.json(result);  // Send the result to the client
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error('Error:', data.toString());
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`);
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});