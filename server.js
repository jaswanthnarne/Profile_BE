require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();

const allowedOrigins = [
  'https://profile.jaswanthnarne.online',
  'https://profile-ui-sable.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174'
];

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow React app to load
}));

app.use(cors({
  origin: process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',')
    : allowedOrigins,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/companies', require('./routes/companyRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));
app.use('/api/testimonials', require('./routes/testimonialRoutes'));
app.use('/api/blog', require('./routes/blogRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/moments', require('./routes/momentRoutes'));

// Serve React Frontend in Production
if (process.env.NODE_ENV === 'production') {
  const frontendBuildPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ message: '🚀 Trainer Portfolio API is running!', version: '1.0.0' });
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const http = require('http');
const socketIo = require('socket.io');

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(',')
      : allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
