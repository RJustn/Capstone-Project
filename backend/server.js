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
const adminRoutes = require('./admin');

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
  checkExpiredAndMigrateBusinessPermit();
  checkBusinessPermitExpiryAndUpdateStatus();
}).catch(err => console.log(err));

app.use('/client', clientRoutes);
app.use('/superadmin', superadminRoutes);
app.use('/datacontroller', datacontollerRoute);
app.use("/admin", adminRoutes);

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
    // Find permits where either 'permitExpiryDate' or 'expiryDate' is expired, and 'workpermitstatus' is not 'Expired'
    const permits = await WorkPermit.find({
      $or: [
        { permitExpiryDate: { $lte: currentDate } },
        { expiryDate: { $lte: currentDate } }
      ],
      workpermitstatus: { $ne: 'Expired' },
    });

    console.log(`Found ${permits.length} expired permits to update.`);

    permits.forEach((permit) => {
      console.log(`Checking Permit: ${permit._id}`);
      console.log(
        `Permit Expiry Date (UTC): ${permit.permitExpiryDate || 'N/A'}, Expiry Date (UTC): ${permit.expiryDate || 'N/A'}, Current Date (UTC): ${currentDate}`
      );
    });

    // Update permits to set 'workpermitstatus' as 'Expired' where applicable
    const result = await WorkPermit.updateMany(
      {
        $or: [
          { permitExpiryDate: { $lte: currentDate } },
          { expiryDate: { $lte: currentDate } }
        ],
        workpermitstatus: { $ne: 'Expired' },
      },
      { $set: { workpermitstatus: 'Expired' } }
    );

    console.log(`${result.modifiedCount} work permits have been updated to expired.`);
  } catch (error) {
    console.error('Error updating expired work permits:', error);
  }
};
 

const checkExpiredAndMigrateBusinessPermit = async () => {
  const currentDate = new Date(Date.now()).toISOString();
  console.log(`Current Date (UTC): ${currentDate}`);

  try {
    // Find all permits that have either permitExpiryDate or expiryDate expired
    const permits = await BusinessPermit.find({
      $or: [
        { permitExpiryDate: { $lte: currentDate } },
        { expiryDate: { $lte: currentDate } },
      ],
      businesspermitstatus: { $ne: 'Expired' },
    });

    console.log(`Found ${permits.length} expired permits to update.`);

    for (const permit of permits) {
      console.log(`Processing Permit ID: ${permit._id}`);
      console.log(
        `Permit Expiry Dates: permitExpiryDate (UTC): ${permit.permitExpiryDate}, expiryDate (UTC): ${permit.expiryDate}, Current Date (UTC): ${currentDate}`
      );

      // Update businesses array: transfer capitalInvestment to lastYearGross
      const updatedBusinesses = permit.businesses.map((business) => {
        if (business.capitalInvestment) {
          business.lastYearGross = business.capitalInvestment; // Move value
          business.capitalInvestment = null; // Clear capitalInvestment
        }
        business.businessType = 'Renew'; // Update the businessType to 'Renew' for all businesses
        return business;
      });

      // Update the permit's businesses and status
      permit.businesses = updatedBusinesses;
      permit.businesspermitstatus = 'Expired';

      // Save the changes
      await permit.save();
      console.log(`Updated permit with ID: ${permit._id}`);
    }

    console.log('All expired permits have been updated successfully.');
  } catch (error) {
    console.error('Error updating expired permits:', error);
  }
};

const checkBusinessPermitExpiryAndUpdateStatus = async () => {
  const currentDate = new Date();
  const threeMonthsAgo = new Date(currentDate.setMonth(currentDate.getMonth() - 3)).toISOString(); // 3 months ago

  console.log(`Current Date (UTC): ${new Date().toISOString()}`);
  console.log(`3 Months Ago Date (UTC): ${threeMonthsAgo}`);

  try {
    // Find all permits that have an expiryDate older than 3 months
    const permits = await BusinessPermit.find({
      expiryDate: { $lte: threeMonthsAgo }, // Check if the expiryDate is older than 3 months
      businesspermitstatus:  'Expired',
      businessstatus: { $ne: 'Inactive' }, // Only update businesses that are not already inactive
    });

    console.log(`Found ${permits.length} expired permits to update.`);

    for (const permit of permits) {
      console.log(`Processing Permit ID: ${permit._id}`);
      console.log(
        `Permit Expiry Date (UTC): ${permit.expiryDate}, 3 Months Ago Date (UTC): ${threeMonthsAgo}`
      );

      // Update the business status to 'Inactive' if the expiryDate is older than 3 months
      permit.businessstatus = 'Inactive';

      // Save the changes
      await permit.save();
      console.log(`Updated business status to 'Inactive' for permit with ID: ${permit._id}`);
    }

    console.log('All expired permits with overdue expiryDate have been updated to Inactive.');
  } catch (error) {
    console.error('Error updating business status:', error);
  }
};




cron.schedule('0 0 * * *', async () => {
  console.log('Running scheduled job to check for expired Business permits.');
  await checkExpired();
  await checkExpiredAndMigrateBusinessPermit();
  await checkBusinessPermitExpiryAndUpdateStatus();
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));