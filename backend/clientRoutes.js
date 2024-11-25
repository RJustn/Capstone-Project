const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { User, BusinessPermit, WorkPermit } = require('./Modals');
const { generateUserId, generatePermitID, generateOtp } = require('./utils');
const transporter = require('./transporter'); // Assuming you have a transporter.js for nodemailer setup

const router = express.Router();
const JWT_SECRET = 'your_jwt_secret'; // Use a strong secret key in production

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// Signup route
router.post('/signup', async (req, res) => {
  const { firstName, middleName, lastName, contactNumber, address, email, password } = req.body;

  if (!firstName || !middleName || !lastName || !email || !password || !contactNumber || !address) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists.' });
    }
    const userID = await generateUserId('CL');
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = "Client";

    const newUser = new User({
      firstName,
      middleName,
      lastName,
      contactNumber,
      address,
      email,
      password: hashedPassword,
      isVerified: false,
      userrole: userRole,
      userId: userID,
    });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully!' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user.isVerified) {
      return res.status(400).json({ error: 'Email is not verified' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    user.isOnline = true;
    user.lastLoginDate = new Date();
    await user.save();

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

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  const token = req.cookies.authToken;

  if (!token) {
    console.error('No token provided');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Check client authentication
router.get('/check-auth-client', authenticateToken, (req, res) => {
  const userRole = req.user.userrole;
  if (userRole === 'Client') {
    return res.sendStatus(204);
  } else {
    return res.status(401).json({ message: 'Unauthorized' });
  }
});

// Check data controller authentication
router.get('/check-auth-datacontroller', authenticateToken, (req, res) => {
  const userRole = req.user.userrole;
  if (userRole === 'Data Controller') {
    return res.sendStatus(204);
  } else {
    return res.status(401).json({ message: 'Unauthorized' });
  }
});

// Logout route
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isOnline = false;
    user.lastLogoutDate = new Date();
    await user.save();

    res.clearCookie('authToken');
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ error: 'Error logging out' });
  }
});

// Profile route
router.get('/profile', authenticateToken, async (req, res) => {
  const token = req.cookies.authToken;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (user) {
      res.status(200).json({ user });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// Send OTP route
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const now = new Date();
    const lastOtpSentAt = user.otpcontent.lastOtpSentAt;
    const otpAttempts = user.otpcontent.otpAttempts;

    if (lastOtpSentAt && otpAttempts >= 5 && (now - lastOtpSentAt) < 3 * 60 * 60 * 1000) {
      return res.status(429).json({ error: 'OTP limit reached. Please try again later.' });
    }

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.otpcontent.otp = otp;
    user.otpcontent.otpExpires = otpExpires;
    await user.save();

    await transporter.sendMail({
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP for email verification is: ${otp}`,
    });

    user.otpcontent.otpAttempts = otpAttempts + 1;
    user.otpcontent.lastOtpSentAt = now;
    await user.save();

    res.status(200).json({ message: 'OTP sent to your email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Verify OTP route
router.post('/verify-emailotp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.otpcontent.otp === otp && user.otpcontent.otpExpires > new Date()) {
      user.isVerified = true;
      user.otpcontent.otp = null;
      user.otpcontent.otpExpires = null;
      user.otpcontent.otpAttempts = null;
      user.otpcontent.lastOtpSentAt = null;
      await user.save();
      res.json({ message: 'Email verified successfully.' });
    } else {
      res.status(400).json({ error: 'Invalid or expired OTP.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error verifying OTP. Please try again.' });
  }
});

// Update password route
router.post('/update-password', async (req, res) => {
  const { email, otp, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.otpcontent.otp === otp && user.otpcontent.otpExpires > new Date()) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      user.otpcontent.otp = null;
      user.otpcontent.otpExpires = null;
      user.otpcontent.otpAttempts = null;
      user.otpcontent.lastOtpSentAt = null;
      await user.save();

      res.json({ message: 'Password updated successfully.' });
    } else {
      res.status(400).json({ error: 'Invalid or expired OTP.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating password. Please try again.' });
  }
});

// Business permit application route
router.post('/businesspermitpage', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const userID = decoded.userId;

    const newBusinessPermit = new BusinessPermit({
      statusBusiness,
      transaction,
      dateIssued,
      expiryDate
    });

    await newBusinessPermit.save();

    const businessPermits = await BusinessPermit.find({ userID });
    
    res.status(200).json({ businessPermits });
    res.status(201).json({ message: 'Business Permit Application submitted successfully!' });
  } catch (error) {
    console.error('Error saving business permit application:', error);
    res.status(500).json({ error: 'An error occurred while saving the application.' });
  }
});

// Work permit application route
router.post('/workpermitpage', upload.fields([
  { name: 'document1', maxCount: 1 },
  { name: 'document2', maxCount: 1 },
  { name: 'document3', maxCount: 1 },
  { name: 'document4', maxCount: 1 }
]), async (req, res) => {
  const token = req.cookies.authToken;
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const files = req.files;
  const {
    lastName,
    firstName,
    middleInitial,
    permanentAddress,
    currentlyResiding,
    temporaryAddress,
    dateOfBirth,
    age,
    placeOfBirth,
    citizenship,
    civilStatus,
    gender,
    height,
    weight,
    mobileTel,
    email,
    educationalAttainment,
    natureOfWork,
    placeOfWork,
    companyName,
    name2,
    mobileTel2,
    address,
    workpermitclassification,
  } = req.body;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;
    const permitID = await generatePermitID('WP');
    const status = "Pending";
    const classification = workpermitclassification;
    let amount;

    if (classification === "New") {
      amount = "0";
    } else if (classification === "Renewal") {
      amount = "200";
    }

    const newWorkPermit = new WorkPermit({
      id: permitID,
      userId,
      workpermitstatus: status,
      classification: classification,
      transaction: null,
      amountToPay: amount,
      permitFile: null,
      permitDateIssued: null,
      permitExpiryDate: null,
      expiryDate: null,
      applicationdateIssued: new Date(Date.now()).toISOString(),
      applicationComments: null,
      formData: {
        personalInformation: {
          lastName,
          firstName,
          middleInitial,
          permanentAddress,
          currentlyResiding: currentlyResiding === 'true',
          temporaryAddress,
          dateOfBirth,
          age,
          placeOfBirth,
          citizenship,
          civilStatus,
          gender,
          height,
          weight,
          mobileTel,
          email,
          educationalAttainment,
          natureOfWork,
          placeOfWork,
          companyName,
          workpermitclassification,
        },
        emergencyContact: {
          name2,
          mobileTel2,
          address,
        },
        files: {
          document1: files.document1 ? files.document1[0].path : null,
          document2: files.document2 ? files.document2[0].path : null,
          document3: files.document3 ? files.document3[0].path : null,
          document4: files.document4 ? files.document4[0].path : null,
        },
      },
      receipt: {
        receiptId: null,
        modeOfPayment: null,
        paymentType: null,
        paymentNumber: null,
        receiptName: null,
        receiptDate: null,
        amountPaid: null,
        receiptFile: null,
      }
    });

    const savedWorkPermit = await newWorkPermit.save();
    await User.findByIdAndUpdate(userId, { $push: { workPermits: savedWorkPermit._id } });
    
    res.status(200).json({ message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Error saving application:', error.message);
    res.status(500).json({ message: 'Error submitting application', error: error.message });
  }
});

// Fetch user work permits
router.get('/fetchuserworkpermits', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).populate('workPermits');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.workPermits);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving work permits', error });
  }
});

// Fetch work permit details
router.get('/workpermitdetails/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).populate('workPermits');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const workPermit = user.workPermits.find(permit => permit._id.toString() === id);
    if (!workPermit) {
      return res.status(404).json({ message: 'Work permit not found for this user' });
    }

    res.json(workPermit);
  } catch (error) {
    console.error('Error retrieving work permit:', error);
    res.status(500).json({ message: 'Error retrieving work permit', error });
  }
});

module.exports = router;