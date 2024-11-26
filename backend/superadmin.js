const express = require('express');
require('dotenv').config();
const router = express.Router();

const { User } = require('./Modals');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = express();
const http = require('http');
const socketIo = require('socket.io');

const JWT_SECRET = 'your_jwt_secret'; // Use a strong secret key in production
const server = http.createServer(app);
const io = socketIo(server);

  router.post('/superadmin/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user.userrole !== 'superadmin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id, userrole: user.userrole }, JWT_SECRET, { expiresIn: '3h' });

    res.cookie('authToken', token, {
      httpOnly: true,
      secure: false, // Set to true in production
      maxAge: 10800000 // 3 hours in milliseconds
    });

    res.status(200).json({
      message: 'Login successful!',
      token,
      role: user.userrole
    });
  } catch (error) {
    console.error('Error during login:', error); // Log the error

    res.status(500).json({ error: 'Error logging in' });
  }
});


const authenticateSuperAdmin = (req, res, next) => {
  const token = req.cookies.authToken;

  if (!token) {
    console.error('No token provided');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    console.log('Token decoded:', req.user); // Check if the decoded token contains the expected data

    if (req.user.userrole !== 'superadmin') {
      console.error('Access denied: user is not a superadmin');
      return res.status(403).json({ message: 'Forbidden' });
    }

    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

router.get('/superadmin/authentication', authenticateSuperAdmin, (req, res) => {
  // Assuming the user role is stored in req.user after token verification
  const userRole = req.user.userrole; // Adjust this if the role key is different
  console.log(userRole);
  if (userRole === 'superadmin') {
    // If the user's role is 'SuperAdmin', respond with a 204 No Content status
    return res.sendStatus(204);
  } else {
    console.log('Access denied: user is not a SuperAdmin');
    // If the user's role is not 'SuperAdmin', respond with a 401 Unauthorized status
    return res.status(401).json({ message: 'Unauthorized' });
  }
});


router.post('/adduser', async (req, res) => {
  const { firstName, middleName, lastName, contactNumber, email, address, password, userrole } = req.body;

  console.log('Incoming data:', req.body);

  try {
    // Check if the user already exists by email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Declare variables for userRole and userID
    let userRole;
    let userID;

    // Assign userRole and userID based on the userrole from the request
    if (userrole === 'ADM') {
      userRole = 'Admin';
      userID = await generateUserId(userrole);
    } else if (userrole === 'CL') {
      userRole = 'Client';
      userID = await generateUserId(userrole);
    } else if (userrole === 'DC') {
      userRole = 'Data Controller';
      userID = await generateUserId(userrole);
    } else {
      return res.status(400).json({ message: 'Invalid user role' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      firstName,
      middleName,
      lastName,
      contactNumber,
      email,
      address,
      userId: userID,
      password: hashedPassword,
      userrole: userRole, // Correct the variable name
      isVerified: true,
      accountOpenedDate: new Date().toISOString(),
      accountOpenedDate: new Date().toISOString()
    });

    // Save the user to the database
    await newUser.save();

    return res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});





router.get('/adminusers', async (req, res) => {
  try {
    const users = await User.find({ userrole: 'Admin' });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/datacontrollers', async (req, res) => {
  try {
    const users = await User.find({ userrole: 'Data Controller' });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



router.get('/accounts/:id', async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// API endpoint to fetch user data by ID
router.delete('/api/accounts/:id', async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ userId: req.params.id });
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.send({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).send(error);
  }
});

// API endpoint to update user data by ID
router.put('/accounts/:id', async (req, res) => {
  try {
    console.log('Request Body:', req.body); // Log the request body
    const user = await User.findOneAndUpdate(
      { userId: req.params.id },
      req.body,
      { new: true }
    );
    if (!user) {
      return res.status(404).send('User not found');
    }
    console.log('Updated User:', user); // Log the updated user
    res.send(user);
  } catch (error) {
    console.error('Error updating user:', error); // Log the error
    res.status(500).send(error);
  }
});



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
module.exports = router;


