const { User, WorkPermit } = require('./Modals');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

// Function to generate unique permit ID
async function generatePermitID(permitType) {
  const today = new Date();
  
  // Get the current date in DDMMYYYY format
  const year = today.getFullYear(); 
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateString = `${day}${month}${year}`;

  try {
      const latestPermit = await WorkPermit.findOne({
          permittype: permitType,
          id: { $regex: `^${permitType}\\d{4}${dateString}$` }
      }).sort({ id: -1 });

      let sequenceNumber = 1;

      if (latestPermit) {
          const latestPermitID = latestPermit.id;
          const match = latestPermitID.match(new RegExp(`^${permitType}(\\d{4})${dateString}$`));

          if (match) {
              sequenceNumber = parseInt(match[1], 10) + 1;
          }
      }

      const sequenceString = String(sequenceNumber).padStart(4, '0');
      const permitID = `${permitType}${sequenceString}${dateString}`;

      return permitID; 
  } catch (error) {
      console.error('Error generating permit ID:', error);
      throw error;
  }
}

// Function to generate unique user ID
async function generateUserId(role) {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const formattedDate = `${year}${month}${day}`;

  try {
      const latestUser = await User.findOne({
          userId: { $regex: `^USER${role}\\d{4}${formattedDate}$` }
      }).sort({ userId: -1 });

      let sequenceNumber = 1;

      if (latestUser) {
          const latestUserID = latestUser.userId;
          const match = latestUserID.match(new RegExp(`^USER${role}(\\d{4})${formattedDate}$`));

          if (match) {
              sequenceNumber = parseInt(match[1], 10) + 1;
          }
      }

      const sequenceString = String(sequenceNumber).padStart(4, '0');
      const userID = `USER${role}${sequenceString}${formattedDate}`;

      return userID; 
  } catch (error) {
      console.error('Error generating user ID:', error);
      throw error;
  }
}

// Function to generate OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Function to seed superadmin user
const seedSuperadmin = async () => {
  const SuperAdmin_Email = process.env.SUPERADMIN_EMAIL;
  const SuperAdmin_Password = process.env.SUPERADMIN_PASSWORD;

  try {
    const superadminExists = await User.findOne({ email: SuperAdmin_Email });
    if (!superadminExists) {
      const hashedPassword = await bcrypt.hash(SuperAdmin_Password, 10);

      const superadminUser = new User({
        email: SuperAdmin_Email,
        password: hashedPassword,
        userrole: 'superadmin',
        userId: 'superadmin',
        isVerified: true,
      });

      await superadminUser.save();
      console.log('Superadmin user created!');
    } else {
      console.log('Superadmin user already exists.');
    }
  } catch (error) {
    console.error('Error seeding superadmin user:', error);
  }
};

// Setup Nodemailer Transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS,  // Your email password or app password
  },
});

module.exports = {
  generatePermitID,
  generateUserId,
  generateOtp,
  seedSuperadmin,
  transporter
};