const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const multer = require('multer');
const session = require('express-session');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { User, BusinessPermit, WorkPermit, Person } = require('./Modals');
const PORT = 3000;
const JWT_SECRET = 'your_jwt_secret'; 
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const PDFDocument = require('pdfkit');
const fs = require('fs');


router.use(cors({
    origin: 'http://localhost:5173', // Update to your frontend URL
    credentials: true // Allow credentials (cookies, authorization headers)
  }));
  router.use(bodyParser.json());
  router.use(express.json());
  router.use(cookieParser());

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASS, 
    },
  });
  
  router.use(session({
    secret: 'your_session_secret', // Replace with a strong secret in production
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true in production with HTTPS
  }));
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname); // Customize the filename
    }
  });
  
  const upload = multer({ storage: storage });


router.post('/signup', async (req, res) => {
    const { firstName, middleName, lastName, contactNumber, address, email, password } = req.body;
  
    // Basic validation
    if (!firstName || !middleName || !lastName || !email || !password || !contactNumber || !address) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
  
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists.' });
      }
      const userID = await generateUserId('CL');
      // Hash the password before saving it to the database 
      const hashedPassword = await bcrypt.hash(password, 10);
      // User is client when registering
      const userRole = "Client"
      // Create new user
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
      console.error('Error creating user:', error); // Log detailed error
    }
  });
  
  // Login route
  router.post('/login', async (req, res) => {
    const { email, password } = req.body; // Assuming you want to keep using email
  
    try {
      const user = await User.findOne({ email });
  
      // Check if user exists
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Check if the account is locked
      if (user.lockUntil && user.lockUntil > Date.now()) {
        const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 60000); // In minutes
        return res.status(403).json({ 
          error: `Too many attepmts! Account is locked. Try again in ${remainingTime} minutes.` 
        });
      }
  
      // Reset loginAttempts and lockUntil if the lock has expired
      if (user.lockUntil && user.lockUntil < Date.now()) {
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();
      }
  
      // Check if the email is verified
      if (!user.isVerified) {
        return res.status(400).json({ error: 'Email is not verified' });
      }
  
      // Check if password is valid
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        user.loginAttempts = (user.loginAttempts || 0) + 1;
  
        // Lock account if max attempts exceeded
        if (user.loginAttempts >= 5) {
          user.lockUntil = Date.now() + 15 * 60 * 1000; // Lock for 15 minutes
        }
  
        await user.save();
        return res.status(400).json({ error: 'Invalid credentials' });
      }
  
      // Reset loginAttempts on successful login
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      user.isOnline = true;
      user.lastLoginDate = new Date(); // Set the last login date
      await user.save();
  
      // Generate JWT
      const token = jwt.sign(
        { userId: user._id, userrole: user.userrole },
        JWT_SECRET,
        { expiresIn: '3h' }
      );
  
      // Set JWT in cookie
      res.cookie('authToken', token, { 
        httpOnly: true, 
        secure: false, // Set to true in production
        maxAge: 10800000 // 3 hours in milliseconds
      });
  
      res.status(200).json({ 
        message: 'Login successful!', 
        token, 
        role: user.userrole // Assuming the field is named `userrole`
      });
    } catch (error) {
      res.status(500).json({ error: 'Error logging in' });
    }
  });
  
  
  const authenticateToken = (req, res, next) => {
    const token = req.cookies.authToken;
  
    if (!token) {
      console.error('No token provided');
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      console.log('Token decoded:', req.user); // Check if the decoded token contains the expected data
      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
  
  
  router.get('/check-auth-client', authenticateToken, (req, res) => {
    // Assuming the user role is stored in req.user after token verification
    const userRole = req.user.userrole; // Adjust this if the role key is different
    console.log(userRole);
    if (userRole === 'Client') {
      // If the user's role is 'client', respond with a 204 No Content status
      return res.sendStatus(204);
    } else {
      console.log('Access denied: user is not a client');
      // If the user's role is not 'client', respond with a 401 Unauthorized status
      return res.status(401).json({ message: 'Unauthorized' });
    }
  });
  
  router.get('/check-auth-datacontroller', authenticateToken, (req, res) => {
    // Assuming the user role is stored in req.user after token verification
    const userRole = req.user.userrole; // Adjust this if the role key is different
    console.log(userRole);
    if (userRole === 'Data Controller') {
      // If the user's role is 'client', respond with a 204 No Content status
      return res.sendStatus(204);
    } else {
      console.log('Access denied: user is not a Data Controller');
      // If the user's role is not 'client', respond with a 401 Unauthorized status
      return res.status(401).json({ message: 'Unauthorized' });
    }
  });

  router.get('/check-auth-admin', authenticateToken, (req, res) => {
    // Assuming the user role is stored in req.user after token verification
    const userRole = req.user.userrole; // Adjust this if the role key is different
    console.log(userRole);
    if (userRole === 'Admin') {
      // If the user's role is 'client', respond with a 204 No Content status
      return res.sendStatus(204);
    } else {
      console.log('Access denied: user is not Admin');
      // If the user's role is not 'client', respond with a 401 Unauthorized status
      return res.status(401).json({ message: 'Unauthorized' });
    }
  });
  
  
  router.post('/logout', authenticateToken, async (req, res) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      user.isOnline = false;
      user.lastLogoutDate = new Date(); // Set the last logout date
      await user.save();
  
  
      res.clearCookie('authToken');
      res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      res.status(500).json({ error: 'Error logging out' });
    }
  });
  
  
  router.get('/profile', async (req, res) => {
    const token = req.cookies.authToken; // Extract token from 'Bearer <token>'
    //console.log('Received token:', token);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    try {
      const decoded = jwt.verify(token, JWT_SECRET); // Decode the JWT to get the userId
     // console.log('Decoded token:', decoded);
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
  

  
  
  // Generate OTP
  const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit OTP
  
  // Send OTP Route
  router.post('/send-otp', async (req, res) => {
    const { email } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }
  
      // Check if cooldown period has passed
      const now = new Date();
      const lastOtpSentAt = user.otpcontent.lastOtpSentAt;
      const otpAttempts = user.otpcontent.otpAttempts;
  
      if (lastOtpSentAt && otpAttempts >= 5 && (now - lastOtpSentAt) < 3 * 60 * 60 * 1000) { // 3 hours
        return res.status(429).json({ error: 'OTP limit reached. Please try again later.' });
      }
  
      // Generate new OTP
      const otp = generateOtp();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes
      user.otpcontent.otp = otp;
      user.otpcontent.otpExpires = otpExpires;
      await user.save();
  
      // Send OTP email
      await transporter.sendMail({
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP for email verification is: ${otp}`,
      });
  
      // Update OTP attempt and timestamp
      user.otpcontent.otpAttempts = otpAttempts + 1;
      user.otpcontent.lastOtpSentAt = now;
      await user.save();
  
      res.status(200).json({ message: 'OTP sent to your email.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server Error' });
    }
  });
  
  // Verify OTP Route
  router.post('/verify-emailotp', async (req, res) => {
    const { email, otp } = req.body;
  
    try {
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }
  
      // Check if OTP matches and is still valid
      if (user.otpcontent.otp === otp && user.otpcontent.otpExpires > new Date()) {
        user.isVerified = true; // Mark email as verified
        user.otpcontent.otp = null; // Clear OTP
        user.otpcontent.otpExpires = null; // Clear OTP expiration
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
  
  // Route for updating the password
  router.post('/update-password', async (req, res) => {
    const { email, otp, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }
  
      // Check if OTP matches and is still valid
      if (user.otpcontent.otp === otp && user.otpcontent.otpExpires > new Date()) {
        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Update the user's password
        user.password = hashedPassword;
        user.otpcontent.otp = null; // Clear OTP after use
        user.otpcontent.otpExpires = null; // Clear OTP expiration
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
  

  //Compute Tax
const computeTax = (businessNature, capitalInvestment, classification) => {
  const conditions = [
    {
      category: 'BNK',
      check: (businessNature ) => businessNature.startsWith('BNK'),
      taxCalculation: (capitalInvestment, classification) => {
        if (classification === '') {
          return 0; // No tax for new businesses
        }
        // Bank-specific tax rules for renew businesses
        if (capitalInvestment <= 1000000) {
          return capitalInvestment * 0.00605; // 60.5% of 1%
        } else {
          return capitalInvestment * 0.005808; // 58.08% of 1%
        }
      }
    },
    {
      category: 'CNT',
      check: (businessNature) => businessNature.startsWith('CNT'),
      taxCalculation: (capitalInvestment, classification) => {
        if (classification === 'New') {
          return 0; // No tax for new businesses
        }
        // Contractor-specific tax rules for renew businesses
        if (capitalInvestment >= 200000 && capitalInvestment <= 300000) {
          return 400; // Fixed tax for this range
        } else if (capitalInvestment > 500000) {
          return 500; // Another fixed tax for larger investments
        } else {
          return 0; // Default tax for other cases
        }
      }
    }
  ];

  // Iterate over conditions to find the matching category
  for (const condition of conditions) {
    if (condition.check(businessNature)) {
      return condition.taxCalculation(capitalInvestment, classification);
    }
  }
  return 0; // Default case if no conditions match
};


const mongoose = require('mongoose');
router.post('/retirebusinessapplication/:id', upload.fields([
  { name: 'document1', maxCount: 1 },
  { name: 'document2', maxCount: 1 },
]), async (req, res) => {
  const token = req.cookies.authToken; // Extract token from the cookie
  const { id } = req.params;
  const files = req.files;
  
  // Check if the user is authorized
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.log('Incoming data:', req.body);
  console.log('Uploaded files:', req.files);

  try {


    // Find the business permit by ID
    const permit = await BusinessPermit.findById(id);

    const updatedPermit = await BusinessPermit.findByIdAndUpdate(
      id,
      {
        $set: {
          // Compute the total amount to pay
          'forretirement': 'ForRetire',
          'files.document11': files.document1 ? files.document1[0].filename : null,
          'files.document12': files.document2 ? files.document2[0].filename : null,
        }
      },
      { new: true } // Return the updated document
    );
    
    if (!updatedPermit) {
      return res.status(404).json({ message: 'BusinessPermit not found' });
    }

    res.status(200).json({ message: 'Update successful', updatedPermit });

  } catch (error) {
    console.error('Error retiring business application:', error);
    res.status(500).json({ error: 'Error retiring business application' });
  }
});





  // Route to get all business permit applications
router.post('/businesspermitpage', upload.fields([
  { name: 'document1', maxCount: 1 },
  { name: 'document2', maxCount: 1 },
  { name: 'document3', maxCount: 1 },
  { name: 'document4', maxCount: 1 },
  { name: 'document5', maxCount: 1 },
  { name: 'document6', maxCount: 1 },
  { name: 'document7', maxCount: 1 },
  { name: 'document8', maxCount: 1 },
  { name: 'document9', maxCount: 1 },
  { name: 'document10', maxCount: 1 }
]), async (req, res) => {
  const token = req.cookies.authToken; // Extract token from the cookie
  // console.log('Received token:', token);
   
   if (!token) {
     return res.status(401).json({ error: 'Unauthorized' });
   }
 
   const files = req.files;
   const {
    //Step 1
     corporation,
     lastname,
     firstname,
     middleinitial,
     civilstatus,
     companyname,
     gender,
     citizenship,
     tinnumber,
     representative,
     repfullname,
     repdesignation,
     repmobilenumber,
     houseandlot,
     buildingstreetname,
     subdivision,
     region,
     province,
     municipality,
     barangay,
     telephonenumber,
     mobilenumber,
     email,

    //Step 2
    businessname,
    businessscale,
    paymentmethod,
    businessbuildingblocklot,
    businessbuildingname,
    businesssubcompname,
    businessregion,
    businessprovince,
    businessmunicipality,
    businessbarangay,
    businesszip,
    businesscontactnumber,
    ownershiptype,
    agencyregistered,
    dtiregistrationnum,
    dtiregistrationdate,
    dtiregistrationexpdate,
    secregistrationnum,
    birregistrationnum,
    industrysector,
    businessoperation,
    typeofbusiness,

    //Step 3
    dateestablished,
    startdate,
    occupancy,
    otherbusinesstype,
    businessemail,
    businessarea,
    businesslotarea,
    numofworkermale,
    numofworkerfemale,
    numofworkertotal,
    numofworkerlgu,
    lessorfullname,
    lessormobilenumber,
    monthlyrent,
    lessorfulladdress,
    lessoremailaddress,
    

    //Step 4
    lat,
    lng,
 
    //Step 5
    businesses,


   } = req.body;
   console.log('Incoming data:', req.body);
   console.log(req.files)


   try {
     const decoded = jwt.verify(token, JWT_SECRET); // Decode the JWT to get the userId
     console.log('Decoded token:', decoded);

     const parsedBusinesses = JSON.parse(businesses);
     const userId = decoded.userId;
     const permitID = await generateBusinessPermitID('BP');
     const status = "Pending";

   // Iterate over parsed businesses and compute tax for each
   const updatedBusinesses = parsedBusinesses.map((business) => {
    const tax = computeTax(business.businessNature, business.capitalInvestment, business.businessType);
    return {
      ...business,
      tax: tax, // Add computed tax to the business object
    };
  });

  const totalCapitalInvestment = updatedBusinesses.reduce((total, business) => total + parseFloat(business.capitalInvestment || 0), 0);

const totalTax = updatedBusinesses.reduce((total, business) => total + parseFloat(business.tax || 0), 0);

     const newBusinessPermit = new BusinessPermit({
       id: permitID,
       userId,
       businesspermitstatus: status,
       businessstatus: 'On Process',
       classification: 'NewBusiness',
       totalgrosssales: totalCapitalInvestment,
       totaltax: totalTax,
       transaction: null,
       amountToPay: null,
       paymentStatus: null,
       permitnumber: null,
       permitFile: null,
       permitDateIssued: null,
       permitExpiryDate: null,
       expiryDate: null,
       applicationdateIssued: new Date(Date.now()).toISOString(),
       applicationComments: null,
       owner:{
        corporation,
     lastname,
     firstname,
     middleinitial,
     civilstatus,
     companyname,
     gender,
     citizenship,
     tinnumber,
     representative,
     houseandlot,
     buildingstreetname,
     subdivision,
     region,
     province,
     municipality,
     barangay,
     telephonenumber,
     mobilenumber,
     email,
        representativedetails: {
          repfullname,
          repdesignation,
          repmobilenumber,
        },
       },
       business: {
        businessname,
        businessscale,
        paymentmethod,
        businessbuildingblocklot,
        businessbuildingname,
        businesssubcompname,
        businessregion,
        businessprovince,
        businessmunicipality,
        businessbarangay,
        businesszip,
        businesscontactnumber,
        ownershiptype,
        agencyregistered,
        dtiregistrationnum,
        dtiregistrationdate,
        dtiregistrationexpdate,
        secregistrationnum,
        birregistrationnum,
        industrysector,
        businessoperation,
        typeofbusiness,
      },
      otherbusinessinfo:{
        dateestablished,
    startdate,
    occupancy,
    otherbusinesstype,
    businessemail,
    businessarea,
    businesslotarea,
    numofworkermale,
    numofworkerfemale,
    numofworkertotal,
    numofworkerlgu,
    lessorfullname,
    lessormobilenumber,
    monthlyrent,
    lessorfulladdress,
    lessoremailaddress,
      },
      mapview:{
      lat,
      lng,
      },
      businesses: updatedBusinesses, // Save businesses as an array
      files: {
        document1: files.document1 ? files.document1[0].filename : null,
        document2: files.document2 ? files.document2[0].filename : null,
        document3: files.document3 ? files.document3[0].filename : null,
        document4: files.document4 ? files.document4[0].filename : null,
        document5: files.document5 ? files.document5[0].filename : null,
        document6: files.document6 ? files.document6[0].filename : null,
        document7: files.document7 ? files.document7[0].filename : null,
        document8: files.document8 ? files.document8[0].filename : null,
        document9: files.document9 ? files.document9[0].filename : null,
        document10: files.document10 ? files.document10[0].filename : null,
        remarksdoc1: null,
        remarksdoc2: null,
        remarksdoc3: null,
        remarksdoc4: null,
        remarksdoc5: null,
        remarksdoc6: null,
        remarksdoc7: null,
        remarksdoc8: null,
        remarksdoc9: null,
        remarksdoc10: null,
      },
      statementofaccount:{
        permitassessed: null,
        dateassessed: null,
        mayorspermit: null,
        sanitary: null,
        health: null,
        businessplate: null,
        zoningclearance: null,
        annualInspection: null,
        environmental: null,
        miscfee: null,
        liquortobaco: null,
        liquorplate: null,
        statementofaccountfile: null
      },
       receipt: {
       receiptId: null, //Generated
       modeOfPayment: null, //online, onsite
       paymentType: null, // gcash, bank payment, onsite
       paymentNumber: null, // gcashnumber, card number
       receiptName: null, //user's name
       receiptDate: null, //date
       amountPaid: null, // amount
       receiptFile: null,
       }
     });
 
     // Save new work permit and retrieve its _id
     const savedBusinessPermit = await newBusinessPermit.save();
     console.log('Saved BusinessPermit ID:', savedBusinessPermit._id); // Log the saved ID
     
     await User.findByIdAndUpdate(userId, { $push: { businessPermits: savedBusinessPermit._id } });
     
     res.status(200).json({ message: 'Application submitted successfully' });
   } catch (error) {
     console.error('Error saving application:', error.message); // Log the error message
     res.status(500).json({ message: 'Error submitting application', error: error.message });
   }
 });

   // Route to get all business permit applications
router.post('/businesspermitrenewal', upload.fields([
  { name: 'document1', maxCount: 1 },
  { name: 'document2', maxCount: 1 },
  { name: 'document3', maxCount: 1 },
  { name: 'document4', maxCount: 1 },
  { name: 'document5', maxCount: 1 },
  { name: 'document6', maxCount: 1 },
  { name: 'document7', maxCount: 1 },
]), async (req, res) => {
  const token = req.cookies.authToken; // Extract token from the cookie
  // console.log('Received token:', token);
   
   if (!token) {
     return res.status(401).json({ error: 'Unauthorized' });
   }
 
   const files = req.files;
   const {
    id,
    //Step 1
     corporation,
     lastname,
     firstname,
     middleinitial,
     civilstatus,
     companyname,
     gender,
     citizenship,
     tinnumber,
     representative,
     repfullname,
     repdesignation,
     repmobilenumber,
     houseandlot,
     buildingstreetname,
     subdivision,
     region,
     province,
     municipality,
     barangay,
     telephonenumber,
     mobilenumber,
     email,

    //Step 2
    businessname,
    businessscale,
    paymentmethod,
    businessbuildingblocklot,
    businessbuildingname,
    businesssubcompname,
    businessregion,
    businessprovince,
    businessmunicipality,
    businessbarangay,
    businesszip,
    businesscontactnumber,
    ownershiptype,
    agencyregistered,
    dtiregistrationnum,
    dtiregistrationdate,
    dtiregistrationexpdate,
    secregistrationnum,
    birregistrationnum,
    industrysector,
    businessoperation,
    typeofbusiness,

    //Step 3
    dateestablished,
    startdate,
    occupancy,
    otherbusinesstype,
    businessemail,
    businessarea,
    businesslotarea,
    numofworkermale,
    numofworkerfemale,
    numofworkertotal,
    numofworkerlgu,
    lessorfullname,
    lessormobilenumber,
    monthlyrent,
    lessorfulladdress,
    lessoremailaddress,
    

    //Step 4
    lat,
    lng,
 
    //Step 5
    businesses,


   } = req.body;
   console.log('Incoming data:', req.body);
   console.log(req.files)


   try {
     const decoded = jwt.verify(token, JWT_SECRET); // Decode the JWT to get the userId
     console.log('Decoded token:', decoded);

     const parsedBusinesses = JSON.parse(businesses);
     const userId = decoded.userId;
     const status = "Pending";

   // Iterate over parsed businesses and compute tax for each
   const updatedBusinesses = parsedBusinesses.map((business) => {
    const tax = computeTax(business.businessNature, business.capitalInvestment, business.businessType);
  
    // Remove the _id field if it exists
    delete business._id;
  
    return {
      ...business,
      tax: tax, // Add computed tax to the business object
    };
  });
  

  const totalCapitalInvestment = updatedBusinesses.reduce((total, business) => total + parseFloat(business.capitalInvestment || 0), 0);

const totalTax = updatedBusinesses.reduce((total, business) => total + parseFloat(business.tax || 0), 0);

     const newBusinessPermit = new BusinessPermit({
       id: id,
       userId,
       businesspermitstatus: status,
       businessstatus: 'On Process', // Use the fetched status or default
       classification: 'RenewBusiness',
       totalgrosssales: totalCapitalInvestment,
       totaltax: totalTax,
       transaction: null,
       amountToPay: null,
       paymentStatus: null,
       permitnumber: null,
       permitFile: null,
       permitDateIssued: null,
       permitExpiryDate: null,
       expiryDate: null,
       applicationdateIssued: new Date(Date.now()).toISOString(),
       applicationComments: null,
       owner:{
        corporation,
     lastname,
     firstname,
     middleinitial,
     civilstatus,
     companyname,
     gender,
     citizenship,
     tinnumber,
     representative,
     houseandlot,
     buildingstreetname,
     subdivision,
     region,
     province,
     municipality,
     barangay,
     telephonenumber,
     mobilenumber,
     email,
        representativedetails: {
          repfullname,
          repdesignation,
          repmobilenumber,
        },
       },
       business: {
        businessname,
        businessscale,
        paymentmethod,
        businessbuildingblocklot,
        businessbuildingname,
        businesssubcompname,
        businessregion,
        businessprovince,
        businessmunicipality,
        businessbarangay,
        businesszip,
        businesscontactnumber,
        ownershiptype,
        agencyregistered,
        dtiregistrationnum,
        dtiregistrationdate,
        dtiregistrationexpdate,
        secregistrationnum,
        birregistrationnum,
        industrysector,
        businessoperation,
        typeofbusiness,
      },
      otherbusinessinfo:{
        dateestablished,
    startdate,
    occupancy,
    otherbusinesstype,
    businessemail,
    businessarea,
    businesslotarea,
    numofworkermale,
    numofworkerfemale,
    numofworkertotal,
    numofworkerlgu,
    lessorfullname,
    lessormobilenumber,
    monthlyrent,
    lessorfulladdress,
    lessoremailaddress,
      },
      mapview:{
      lat,
      lng,
      },
      businesses: updatedBusinesses, // Save businesses as an array
      files: {
        document1: files.document1 ? files.document1[0].filename : null,
        document2: files.document2 ? files.document2[0].filename : null,
        document3: files.document3 ? files.document3[0].filename : null,
        document4: files.document4 ? files.document4[0].filename : null,
        document5: files.document5 ? files.document5[0].filename : null,
        document6: files.document6 ? files.document6[0].filename : null,
        document7: files.document7 ? files.document7[0].filename : null,
        remarksdoc1: null,
        remarksdoc2: null,
        remarksdoc3: null,
        remarksdoc4: null,
        remarksdoc5: null,
        remarksdoc6: null,
        remarksdoc7: null,
      },
      statementofaccount:{
        permitassessed: null,
        dateassessed: null,
        mayorspermit: null,
        sanitary: null,
        health: null,
        businessplate: null,
        zoningclearance: null,
        annualInspection: null,
        environmental: null,
        miscfee: null,
        liquortobaco: null,
        liquorplate: null,
        statementofaccountfile: null
      },
       receipt: {
       receiptId: null, //Generated
       modeOfPayment: null, //online, onsite
       paymentType: null, // gcash, bank payment, onsite
       paymentNumber: null, // gcashnumber, card number
       receiptName: null, //user's name
       receiptDate: null, //date
       amountPaid: null, // amount
       receiptFile: null,
       }
     });
 
     // Save new work permit and retrieve its _id
     const savedBusinessPermit = await newBusinessPermit.save();
     console.log('Saved BusinessPermit ID:', savedBusinessPermit._id); // Log the saved ID
     
     await User.findByIdAndUpdate(userId, { $push: { businessPermits: savedBusinessPermit._id } });
     
     res.status(200).json({ message: 'Application submitted successfully' });
   } catch (error) {
     console.error('Error saving application:', error.message); // Log the error message
     res.status(500).json({ message: 'Error submitting application', error: error.message });
   }
 });
  
  router.post('/workpermitpage', upload.fields([
    { name: 'document1', maxCount: 1 },
    { name: 'document2', maxCount: 1 },
    { name: 'document3', maxCount: 1 },
    { name: 'document4', maxCount: 1 }
  ]), async (req, res) => {
    const token = req.cookies.authToken; // Extract token from the cookie
   // console.log('Received token:', token);
    
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
    console.log('Incoming data:', req.body);
    console.log(req.files)
    try {
      const decoded = jwt.verify(token, JWT_SECRET); // Decode the JWT to get the userId
      console.log('Decoded token:', decoded);
      
      const userId = decoded.userId;
      const permitID = await generatePermitID('WP');
      const status = "Pending";
      const classification = workpermitclassification;
      let amount; // Declare amountToPay outside the if-else block
  
      if (classification === "New") {
        amount = "0"; // Set amount for New classification
      } else if (classification === "Renewal") {
        amount = "200"; // Set amount for Renew classification
      }
  
      // Create a new WorkPermit instance
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
            document1: files.document1 ? files.document1[0].filename : null,
            document2: files.document2 ? files.document2[0].filename : null,
            document3: files.document3 ? files.document3[0].filename : null,
            document4: files.document4 ? files.document4[0].filename : null,
          },
        },
        receipt: {
        receiptId: null, //Generated
        modeOfPayment: null, //online, onsite
        paymentType: null, // gcash, bank payment, onsite
        paymentNumber: null, // gcashnumber, card number
        receiptName: null, //user's name
        receiptDate: null, //date
        amountPaid: null, // amount
        receiptFile: null,
        }
      });
  
      // Save new work permit and retrieve its _id
      const savedWorkPermit = await newWorkPermit.save();
      console.log('Saved WorkPermit ID:', savedWorkPermit._id); // Log the saved ID
      
      await User.findByIdAndUpdate(userId, { $push: { workPermits: savedWorkPermit._id } });
      
      res.status(200).json({ message: 'Application submitted successfully' });
    } catch (error) {
      console.error('Error saving application:', error.message); // Log the error message
      res.status(500).json({ message: 'Error submitting application', error: error.message });
    }
  });
  
  
  // Function to generate unique permit ID
  async function generatePermitID(permitType) {
    const today = new Date();
    
    // Get the current date in DDMMYYYY format
    const year = today.getFullYear(); 
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateString = `${day}${month}${year}`;
  
    try {
        // Fetch the latest permit ID for the given permit type where the ID matches today's date exactly
        const latestPermit = await WorkPermit.findOne({
            permittype: permitType,
            id: { $regex: `^${permitType}\\d{4}${dateString}$` } // Match permits for today
        }).sort({ id: -1 }); // Sort to get the latest permit ID for today
  
        let sequenceNumber = 1; // Default to 1 if no permits exist for today
  
        if (latestPermit) {
            // Extract the sequence number from the latest permit ID
            const latestPermitID = latestPermit.id;
  
            // Use a regex to extract the 4-digit sequence part (assuming format: WP0001DDMMYYYY)
            const match = latestPermitID.match(new RegExp(`^${permitType}(\\d{4})${dateString}$`));
  
            if (match) {
                sequenceNumber = parseInt(match[1], 10) + 1; // Increment by 1
            }
        }
  
        // Pad sequence number to ensure it's always 4 digits
        const sequenceString = String(sequenceNumber).padStart(4, '0');
  
        // Construct the final permit ID
        const permitID = `${permitType}${sequenceString}${dateString}`;
  
        // Return the constructed permit ID
        return permitID; 
    } catch (error) {
        console.error('Error generating permit ID:', error);
        throw error; // or handle the error as needed
    }
  }

  async function generateBusinessPermitID(permitType) {
    const today = new Date();
    
    // Get the current date in DDMMYYYY format
    const year = today.getFullYear(); 
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateString = `${day}${month}${year}`;
  
    try {
        // Fetch the latest permit ID for the given permit type where the ID matches today's date exactly
        const latestPermit = await BusinessPermit.findOne({
            permittype: permitType,
            id: { $regex: `^${permitType}\\d{4}${dateString}$` } // Match permits for today
        }).sort({ id: -1 }); // Sort to get the latest permit ID for today
  
        let sequenceNumber = 1; // Default to 1 if no permits exist for today
  
        if (latestPermit) {
            // Extract the sequence number from the latest permit ID
            const latestPermitID = latestPermit.id;
  
            // Use a regex to extract the 4-digit sequence part (assuming format: WP0001DDMMYYYY)
            const match = latestPermitID.match(new RegExp(`^${permitType}(\\d{4})${dateString}$`));
  
            if (match) {
                sequenceNumber = parseInt(match[1], 10) + 1; // Increment by 1
            }
        }
  
        // Pad sequence number to ensure it's always 4 digits
        const sequenceString = String(sequenceNumber).padStart(4, '0');
  
        // Construct the final permit ID
        const permitID = `${permitType}${sequenceString}${dateString}`;
  
        // Return the constructed permit ID
        return permitID; 
    } catch (error) {
        console.error('Error generating permit ID:', error);
        throw error; // or handle the error as needed
    }
  }
  
  async function generateUserId(role) {
    const today = new Date();
  
    // Get the current date in YYYYMMDD format
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}${month}${day}`; // YYYYMMDD format
  
    try {
        // Fetch the latest user ID for the given role
        const latestUser = await User.findOne({
            userId: { $regex: `^USER${role}\\d{4}${formattedDate}$` } // Match users for today
        }).sort({ userId: -1 }); // Sort to get the latest user ID for today
  
        let sequenceNumber = 1; // Default to 1 if no users exist for today
  
        if (latestUser) {
            // Extract the sequence number from the latest user ID
            const latestUserID = latestUser.userId;
  
            // Use a regex to extract the 4-digit sequence part (assuming format: USER<role><seq><date>)
            const match = latestUserID.match(new RegExp(`^USER${role}(\\d{4})${formattedDate}$`));
  
            if (match) {
                sequenceNumber = parseInt(match[1], 10) + 1; // Increment by 1
            }
        }
  
        // Pad sequence number to ensure it's always 4 digits
        const sequenceString = String(sequenceNumber).padStart(4, '0');
  
        // Construct the final user ID
        const userID = `USER${role}${sequenceString}${formattedDate}`;
  
        // Return the constructed user ID
        return userID; 
    } catch (error) {
        console.error('Error generating user ID:', error);
        throw error; // or handle the error as needed
    }
  }
  
  // Example usage
  async function createUser(role) {
    const userId = await generateUserId(role);
    console.log('Generated User ID:', userId);
    // Here you can create the user in your database with the generated user ID
  }
  
  // Example calls
  //createUser('ADM'); // For Admin
  //createUser('DC'); // For Data Controller
  //createUser('CL'); // For Client
  
  
  
  router.get('/fetchuserworkpermits', async (req, res) => {
    const token = req.cookies.authToken; // Extract token from the cookie
  // console.log('Received token:', token);
    try {
      
      const decoded = jwt.verify(token, JWT_SECRET); // Decode the JWT to get the userId
      console.log('Decoded token:', decoded);
      const userId = decoded.userId;
  
      // Fetch user and populate work permits
      const user = await User.findById(userId).populate('workPermits');
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Send the populated work permits to the client
      res.json(user.workPermits);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving work permits', error });
    }
  });

  router.get('/fetchuserbusinesspermits', async (req, res) => {
    const token = req.cookies.authToken; // Extract token from the cookie
  // console.log('Received token:', token);
    try {
      
      const decoded = jwt.verify(token, JWT_SECRET); // Decode the JWT to get the userId
      console.log('Decoded token:', decoded);
      const userId = decoded.userId;
  
      // Fetch user and populate work permits
      const user = await User.findById(userId).populate('businessPermits');
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Send the populated work permits to the client
      res.json(user.businessPermits);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving work permits', error });
    }
  });
  
  
  router.get('/workpermitdetails/:id', async (req, res) => {
    const { id } = req.params;
    const token = req.cookies.authToken; // Extract token from the cookie
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET); // Decode the JWT to get userId
      const userId = decoded.userId;
  console.log(userId);
      // Find the user by ID
      const user = await User.findById(userId).populate('workPermits'); // Populate work permits
  console.log(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Check if the user has the specified work permit
      const workPermit = user.workPermits.find(permit => permit._id.toString() === id);
      console.log(workPermit);
      if (!workPermit) {
        return res.status(404).json({ message: 'Work permit not found for this user' });
      }
  
      // Return the specific work permit details
      res.json(workPermit);
    } catch (error) {
      console.error('Error retrieving work permit:', error);
      res.status(500).json({ message: 'Error retrieving work permit', error });
    }
  });
  

  router.get('/businesspermitdetails/:id', async (req, res) => {
    const { id } = req.params;
    const token = req.cookies.authToken; // Extract token from the cookie
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET); // Decode the JWT to get userId
      const userId = decoded.userId;
  console.log(userId);
      // Find the user by ID
      const user = await User.findById(userId).populate('businessPermits'); // Populate work permits
  console.log(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Check if the user has the specified work permit
      const businessPermit = user.businessPermits.find(permit => permit._id.toString() === id);
      console.log(businessPermit);
      if (!businessPermit) {
        return res.status(404).json({ message: 'Work permit not found for this user' });
      }
  
      // Return the specific work permit details
      res.json(businessPermit);
    } catch (error) {
      console.error('Error retrieving work permit:', error);
      res.status(500).json({ message: 'Error retrieving work permit', error });
    }
  });
  
  
  // Apptest Codes @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  
  router.post('/apptesting', upload.fields([
    { name: 'document1', maxCount: 1 },
    { name: 'document2', maxCount: 1 },
    { name: 'document3', maxCount: 1 },
  ]), async (req, res) => {
    const { name, email, age, address, phoneNumber, isActive } = req.body;
    const files = req.files;
    try {
      const newPerson = new Person({
        name,
        email,
        applicationForm: {
          age,
          address,
          phoneNumber,
          isActive: isActive === 'true',
        },
       files: {
          document1: files.document1 ? files.document1[0].path : null,
          document2: files.document2 ? files.document2[0].path : null,
          document3: files.document3 ? files.document3[0].path : null,
  
        },
      });
  
      await newPerson.save();
      res.status(201).json(newPerson);
    } catch (error) {
      console.error('Error saving application:', error);
      res.status(500).json({ message: 'Error submitting application' });
    }
  });
  // Apptest Codes @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  
  router.get('/workpermits', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from 'Bearer <token>'
    //console.log('Received token:', token);
    try {
      
      const decoded = jwt.verify(token, JWT_SECRET); // Decode the JWT to get the userId
     // console.log('Decoded token:', decoded);
      const userId = decoded.userId;
  
      // Fetch user and populate work permits
      const user = await User.findById(userId).populate('workPermits');
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Send the populated work permits to the client
      res.json(user.workPermits);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving work permits', error });
    }
  });
  
  // Apptest Codes @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  
  router.get('/api/:searchTerm', async (req, res) => {
    const { searchTerm } = req.params;
    
    try {
      const users = await Person.find({
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } }
        ]
      });
      
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  


  // Apptest Codes @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  router.use('/uploads', express.static('uploads'));

    // Ensure the receipts directory exists
    const receiptsDir = path.join(__dirname, 'receipts');
    if (!fs.existsSync(receiptsDir)) {
        fs.mkdirSync(receiptsDir);
    }
    // Serve static files from the receipts directory
    router.use('/receipts', express.static(receiptsDir));
  
     // Ensure the receipts directory exists
     const uploadsDir = path.join(__dirname, 'uploads');
     if (!fs.existsSync(uploadsDir)) {
         fs.mkdirSync(uploadsDir);
     }
     // Serve static files from the receipts directory
     router.use('/uploads', express.static(uploadsDir));
    
    
    
    // Define and create the workPermitsDir
    const workPermitsDir = path.join(__dirname, 'permits'); 
    if (!fs.existsSync(workPermitsDir)) {
      fs.mkdirSync(workPermitsDir);
    }



    // Serve the 'workpermits' directory as static files
    router.use('/permits', express.static(workPermitsDir));


// Fetch and group user's business permits by 'id'
router.get('/business-permits', async (req, res) => {
  const token = req.cookies.authToken; // Extract token from the cookie

  try {
    // Decode the JWT token to get the user ID
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    // Fetch all business permits associated with the user
    const user = await User.findById(userId).populate('businessPermits');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userBusinessPermits = user.businessPermits;

    // Group business permits by 'id' field (not _id)
    const groupedBusinessPermits = userBusinessPermits.reduce((acc, permit) => {
      const permitId = permit.id; // Use the `id` field for grouping
      if (!acc[permitId]) {
        acc[permitId] = [];
      }
      acc[permitId].push(permit);
      return acc;
    }, {});

    // Convert grouped data to an array for frontend consumption
    const groupedArray = Object.entries(groupedBusinessPermits).map(([id, permits]) => ({
      id,
      permits,
    }));

    // Respond with grouped permits
    res.json(groupedArray);
  } catch (error) {
    console.error('Error fetching or grouping business permits:', error);
    res.status(500).json({ message: 'Error retrieving business permits', error });
  }
});

const generatePermitNumber = async (year) => {
  // Get the count of paid permits for the current year
  const paidPermitsThisYear = await BusinessPermit.find({
    createdAt: { 
      $gte: new Date(`${year}-01-01`),
      $lt: new Date(`${year + 1}-01-01`),
    },
    paymentStatus: 'Paid',  // Filter by payment status
  }).countDocuments(); // Get the count of paid permits only

  // Permit number is the count of paid permits + 1
  return paidPermitsThisYear + 1;
};

const generateBusinessPermitPDF = async (ContentData, permitNumber) => {
  const doc = new PDFDocument();
  const businessPermitFileName = `businessPermit_${ContentData}.pdf`; // File name based on the ID
  const businessPermitPath = path.join(workPermitsDir, businessPermitFileName);

  try {
    // Fetch the business permit data by ID
    const businessPermit = await BusinessPermit.findById(ContentData);
console.log(ContentData);
    if (!businessPermit) {
      throw new Error('Work permit not found');
    }

    // Ensure the output directory exists
    if (!fs.existsSync(workPermitsDir)) {
      fs.mkdirSync(workPermitsDir, { recursive: true });
    }

    const writeStream = fs.createWriteStream(businessPermitPath);
    doc.pipe(writeStream);

    // Add content to the PDF
    doc.fontSize(20).text('Work Permit', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`BusinessPermit Permit ID: ${businessPermit.id}`);
    doc.text(`Issued To: ${businessPermit.owner?.lastname || 'Unknown'}`);
    doc.text(`Classification: ${businessPermit.classification || 'Not Specified'}`);
    doc.text(`Permit Number: ${permitNumber}`);
    doc.text(`Permit Status: Released`);
    doc.text(`Issue Date: ${new Date().toISOString().split('T')[0]}`); // ISO format for consistency
    doc.text(
      `Expiration Date: ${new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
      ).toISOString().split('T')[0]}`
    );

    doc.end();

    console.log(`Work Permit PDF created at ${businessPermitPath}`);

    return businessPermitFileName; // Return the file name
  } catch (error) {
    console.error('Error generating work permit PDF:', error);
    throw error;
  }
};

router.put('/updatepayments/:id', async (req, res) => {
  const { id } = req.params; // Get the permit ID from the URL
  const { paymentStatus, businesspermitstatus } = req.body; // Get the payment status from the request body

  try {
    // Get the current year and calculate next year's January 1st
    const nextYear = new Date().getFullYear() + 1;
    const nextYearJan1 = new Date(nextYear, 0, 1); // January 1st of the next year

    // Generate the permit number
    const permitNumber = await generatePermitNumber(nextYear);
    const businessPermitFile = await generateBusinessPermitPDF(id, permitNumber);
    const receiptfile = await generatereceipt(id);

    // Find the permit by ID and update it
    const permit = await BusinessPermit.findByIdAndUpdate(
      id,
      {
        paymentStatus,
        businesspermitstatus,
        permitnumber: permitNumber, // Assign the generated permit number
        permitDateIssued: new Date().toISOString(), // Current date
        permitExpiryDate: nextYearJan1.toISOString(), // Set to Jan 1st of next year
        expiryDate: nextYearJan1.toISOString(), // Set to Jan 1st of next year
        permitFile: businessPermitFile,
        businessstatus: 'Active',

        receipt: {
          receiptDate: new Date().toISOString(),
          amountPaid: 200, // To change
          receiptFile: receiptfile,
        }
      },
      { new: true }
    );

    // Check if permit was found and updated
    if (!permit) {
      return res.status(404).json({ message: 'Permit not found' });
    }

    res.status(200).json({ message: 'Payment status and permit number updated', permit });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating payment status' });
  }
});

  // Function to generate Statement of Account PDF
  const generatereceipt = async (id) => {
    const doc = new PDFDocument();
    const receiptFileName = `businesspermit_receipt_${id}.pdf`;
    const receiptPath = path.join(receiptsDir, receiptFileName);



    
        try {
            // Fetch the work permit data by ID
            const businessPermit = await BusinessPermit.findById(id);
      
            if (!businessPermit) {
                throw new Error('Work permit not found');
            }
      
      
            const writeStream = fs.createWriteStream(receiptPath);
            doc.pipe(writeStream);
            doc.fontSize(25).text('Official Receipt', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`);
            doc.text(`Receipt ID: ${uuidv4()}`);
            doc.text(`Business Owner: ${businessPermit.owner.lastname} ${businessPermit.owner.firstname}`);
            doc.text(`Business Permit ID: ${businessPermit.id}`);
            doc.text(`Mode of Payment: ${businessPermit.business.paymentmethod}`);
            doc.moveDown();
            doc.text(`Total Amount: ₱${businessPermit.totaltax}`, { bold: true });
          
      
            doc.end();
      
            console.log(`Work Permit PDF created at ${receiptFileName}`);
      
            return receiptFileName;  // Return the path to the generated PDF
        } catch (error) {
            console.error('Error generating work permit PDF:', error);
            throw error;
        }

};


  module.exports = router;