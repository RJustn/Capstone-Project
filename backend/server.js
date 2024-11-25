require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');
const { seedSuperadmin, checkExpired, transporter } = require('./utils'); 
const clientRoutes = require('./clientRoutes'); 
const superadminRoutes = require('./superadminRoutes'); 
const dataControllerRoutes = require('./dataControllerRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Update to your frontend URL
  credentials: true // Allow credentials (cookies, authorization headers)
}));
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());

app.use(session({
  secret: 'your_session_secret', // Replace with a strong secret in production
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/obpwlsdatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
  seedSuperadmin(); // Seed superadmin on startup
  checkExpired();
}).catch(err => console.log(err));

// Use routes
app.use('/api/client', clientRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/datacontroller', dataControllerRoutes);

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start the server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('userOnline', async (userId) => {
    await User.findByIdAndUpdate(userId, { isOnline: true });
    io.emit('statusUpdate', { userId, isOnline: true });
  });

  socket.on('userOffline', async (userId) => {
    await User.findByIdAndUpdate(userId, { isOnline: false });
    io.emit('statusUpdate', { userId, isOnline: false });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Schedule a job to run every day at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running scheduled job to check for expired work permits.');
  await checkExpired(); // Call the function to check for expired permits
});