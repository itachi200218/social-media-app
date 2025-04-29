const express = require('express');
const path = require('path');
const { spawn } = require('child_process');
require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');

// Import route files
const authRoutes = require('./routers/auth');
const postsRoutes = require('./routers/posts');
const dashboardRoutes = require('./routers/dashboard');
const messageRoutes = require('./routers/messages');
const authenticateToken = require('./middleware/auth');

// Initialize the app
const app = express();

// ✅ CORS setup for frontend on Vercel
app.use(cors({
  origin: 'https://social-media-app-nu-two.vercel.app',
  credentials: true
}));

// ✅ Additional CORS headers to support iPhone (Safari)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://social-media-app-nu-two.vercel.app");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Fitness AI route (serving the fitness AI page)
app.get('/fitness', (req, res) => {
    res.sendFile(path.join(__dirname, 'fitness.html'));
});

// Route to trigger the fitness AI Python script
app.post('/start-fitness', (req, res) => {
    const pythonProcess = spawn('python', ['fitness_ai.py']);

    pythonProcess.stdout.on('data', (data) => {
        const result = JSON.parse(data.toString());
        console.log(result);
        res.json(result);
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

// Protected test route
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
  useNewUrlParser: true,
  useUnifiedTopology: true
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
