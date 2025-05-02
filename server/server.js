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
const userRoutes = require('./routers/users');

// Initialize the app
const app = express();

// ✅ Allow local and deployed frontends dynamically
const allowedOrigins = [
  process.env.CLIENT_URL, // Local URL
  process.env.PRODUCTION_URL // Production URL
];

// ✅ CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g., curl, mobile apps)
    if (!origin) return callback(null, true);
    
    // If the origin matches one of the allowed URLs
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// ✅ CORS headers manually set for extra support (e.g. Safari)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
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
app.use('/api/users', userRoutes);

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
