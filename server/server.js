const express = require('express');
const path = require('path');
const { spawn } = require('child_process'); // This allows you to run Python scripts
require('dotenv').config(); // Load environment variables from .env
const mongoose = require('mongoose');
const cors = require('cors');

// Import route files (auth, posts, etc.)
const authRoutes = require('./routers/auth');         // /api/auth
const postsRoutes = require('./routers/posts');       // /api/posts
const dashboardRoutes = require('./routers/dashboard'); // /api/dashboard
const authenticateToken = require('./middleware/auth'); // Middleware to verify JWT
const messageRoutes = require('./routers/messages');

// Initialize the app
const app = express();
const port = 3000;

// Middleware for CORS and JSON handling
app.use(cors({ origin: '*' })); // Allow all domains to access your API
app.use(express.json());

// Serve static files (like JS, CSS)
app.use(express.static(path.join(__dirname, 'public')));



// Route to trigger the fitness AI Python script
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

// Root route
app.get('/', (req, res) => {
  res.send('Server is up and running!');
});

// ✅ Protected test route
app.get('/api/test', authenticateToken, (req, res) => {
  res.json({ message: 'Token is valid ✅', user: req.user });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/messages', messageRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URL, {
 
})
.then(() => {
  console.log('✅ Database connected');
})
.catch((err) => {
  console.error('❌ Database connection failed:', err);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
