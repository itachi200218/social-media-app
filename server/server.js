const express = require('express');
const path = require('path');
const { spawn } = require('child_process');
require('dotenv').config(); // Load .env variables
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// ✅ CORS setup for both local and production
const allowedOrigins = [
  process.env.CLIENT_URL,        // e.g., http://localhost:3000
  process.env.PRODUCTION_URL     // your deployed frontend URL
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Import Routes
const authRoutes = require('./routers/auth');
const postsRoutes = require('./routers/posts');
const dashboardRoutes = require('./routers/dashboard');
const messageRoutes = require('./routers/messages');
const userRoutes = require('./routers/users');
const chatRoutes = require('./routers/chat'); // <-- Moved chatbot to its own file
const authenticateToken = require('./middleware/auth');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes); // <-- Chat routes

// Fitness AI HTML Page
app.get('/fitness', (req, res) => {
  res.sendFile(path.join(__dirname, 'fitness.html'));
});

// Fitness AI Backend (Python script)
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

// Test protected route
app.get('/api/test', authenticateToken, (req, res) => {
  res.json({ message: 'Token is valid ✅', user: req.user });
});

// Root route
app.get('/', (req, res) => {
  res.send('Server is up and running!');
});

// ✅ Connect to MongoDB
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

// ✅ Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

