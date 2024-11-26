require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const http = require('http');
const cron = require('node-cron');
const bcrypt = require('bcrypt');
const path = require('path');

const { User, BusinessPermit, WorkPermit } = require('./Modals');
const superadminRoutes = require('./superadmin');
const clientRoutes = require('./client');
const datacontollerRoute = require('./datacontroller');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'your_jwt_secret'; // Use a strong secret key in production
const server = http.createServer(app);

app.use(cors({
  origin: 'http://localhost:5173', // Update to your frontend URL
  credentials: true // Allow credentials (cookies, authorization headers)
}));
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());

mongoose.connect('mongodb://localhost:27017/obpwlsdatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
  seedSuperadmin(); // Seed superadmin on startup
  checkExpired();
}).catch(err => console.log(err));

app.use('/client', clientRoutes);
app.use('/superadmin', superadminRoutes);
app.use('/datacontroller', datacontollerRoute);

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

const checkExpired = async () => {
  const currentDate = new Date(Date.now()).toISOString();
  console.log(`Current Date (UTC): ${currentDate}`);

  try {
    const permits = await WorkPermit.find({
      permitExpiryDate: { $lte: currentDate },
      workpermitstatus: { $ne: 'Expired' }
    });

    permits.forEach(permit => {
      console.log(`Checking Permit: ${permit._id}`);
      console.log(`Permit Expiry Date (UTC): ${permit.permitExpiryDate}, Current Date (UTC): ${currentDate}`);
    });

    const result = await WorkPermit.updateMany(
      {
        permitExpiryDate: { $lte: currentDate },
        workpermitstatus: { $ne: 'Expired' }
      },
      { $set: { workpermitstatus: 'Expired' } }
    );

    console.log(`${result.modifiedCount} work permits have been updated to expired.`);
  } catch (error) {
    console.error('Error updating expired work permits:', error);
  }
};

cron.schedule('0 0 * * *', async () => {
  console.log('Running scheduled job to check for expired work permits.');
  await checkExpired();
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));