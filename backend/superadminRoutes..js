const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('./Modals');
const { generateUserId } = require('./utils');

const router = express.Router();
const JWT_SECRET = 'your_jwt_secret'; // Replace with your actual secret

router.post('/superadmin/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user.isVerified) {
      return res.status(400).json({ error: 'Email is not verified' });
    }

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
    console.log('Token decoded:', req.user);

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
  const userRole = req.user.userrole;
  console.log(userRole);
  if (userRole === 'superadmin') {
    return res.sendStatus(204);
  } else {
    console.log('Access denied: user is not a SuperAdmin');
    return res.status(401).json({ message: 'Unauthorized' });
  }
});

router.post('/adduser', async (req, res) => {
  const { firstName, middleName, lastName, contactNumber, email, address, password, userrole } = req.body;

  console.log('Incoming data:', req.body);
  
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    let userRole;
    let userID;

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

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      middleName,
      lastName,
      contactNumber,
      email,
      address,
      userId: userID,
      password: hashedPassword,
      userrole: userRole,
      isVerified: true,
      accountOpenedDate: new Date().toISOString(),
      accountOpenedDate: new Date().toISOString()
    });

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

router.put('/accounts/:id', async (req, res) => {
  try {
    console.log('Request Body:', req.body);
    const user = await User.findOneAndUpdate(
      { userId: req.params.id },
      req.body,
      { new: true }
    );
    if (!user) {
      return res.status(404).send('User not found');
    }
    console.log('Updated User:', user);
    res.send(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send(error);
  }
});

module.exports = { router, seedSuperadmin };