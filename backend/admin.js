const express = require('express');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const cron = require('node-cron');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const router = express.Router();
const { User, WorkPermit, BusinessPermit } = require('./Modals');

router.use(express.json());

router.get('/getworkpermitsforassessment', async (req, res) => {
  try {
    const pendingWorkPermits = await WorkPermit.find({ workpermitstatus: 'Pending' });
    res.json(pendingWorkPermits);
  } catch (error) {
    console.error('Error fetching work permits:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/getworkpermitsforpayments', async (req, res) => {
  try {
    const pendingWorkPermits = await WorkPermit.find({ workpermitstatus: 'Waiting for Payment' });
    res.json(pendingWorkPermits);
  } catch (error) {
    console.error('Error fetching work permits:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/getworkpermitsforrelease', async (req, res) => {
  try {
    const pendingWorkPermits = await WorkPermit.find({ workpermitstatus: { $in: ['Released', 'Expired'] } });
    res.json(pendingWorkPermits);
  } catch (error) {
    console.error('Error fetching work permits:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/adminworkpermitdetails/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const workPermit = await WorkPermit.findById(id);
    if (!workPermit) {
      return res.status(404).json({ message: 'Work permit not found' });
    }
    res.json(workPermit);
  } catch (error) {
    console.error('Error retrieving work permit:', error);
    res.status(500).json({ message: 'Error retrieving work permit', error });
  }
});

router.put('/work-permits/:id', async (req, res) => {
  console.log('Request body:', req.body);
  const { id } = req.params;
  const { status } = req.body;
  const ContentData = { id: id };
  try {
    let updateFields = {};
    if (status === 'Released') {
      const workpermitFileName = await generateWorkPermitPDF(ContentData);
      updateFields = {
        permitFile: workpermitFileName,
        transaction: 'First Time Job Seeker',
        permitDateIssued: new Date().toISOString(),
        workpermitstatus: status,
        permitExpiryDate: new Date(Date.now() + 31536000000).toISOString(),
        expiryDate: new Date(Date.now() + 31536000000).toISOString(),
      };
    } else if (status === 'Waiting for Payment') {
      updateFields = {
        workpermitstatus: status,
        permitExpiryDate: null,
        expiryDate: new Date(Date.now() + 31536000000).toISOString(),
      };
    } else {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const updatedPermit = await WorkPermit.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );
    if (!updatedPermit) {
      return res.status(404).json({ message: 'Work permit not found' });
    }
    res.json(updatedPermit);
    console.log('Updated Permit:', updatedPermit);
  } catch (error) {
    console.error('Error updating work permit:', error);
    res.status(500).json({ error: 'Error updating work permit' });
  }
});

router.put('/work-permitsreject/:id', async (req, res) => {
  console.log('Request body:', req.body);
  const { id } = req.params;
  const { status, comments } = req.body;
  try {
    const updatedPermit = await WorkPermit.findByIdAndUpdate(
      id,
      { 
        $set: {
          workpermitstatus: status,
          applicationComments: comments,
        }
      },
      { new: true }
    );
    if (!updatedPermit) {
      return res.status(404).json({ message: 'Work permit not found' });
    }
    res.json(updatedPermit);
    console.log(new Date(Date.now() + 31536000000));
  } catch (error) {
    console.error('Error updating work permit:', error);
    res.status(500).json({ error: 'Error updating work permit' });
  }
});

router.put('/handlepayments/:id', async (req, res) => {
  console.log('Request params:', req.params);
  console.log('Request body:', req.body);
  const { id } = req.params;
  const receiptID = uuidv4();
  const { accountNumber, amount, paymentName, paymentMethod, paymentType } = req.body;
  const ContentData = {
    accountNumber: accountNumber, 
    amount: amount, 
    paymentName: paymentName, 
    paymentMethod: paymentMethod, 
    paymentType: paymentType,
    receiptID: receiptID,
    id: id,
  };
  try {
    const receiptFileName = generateReceiptPDF(ContentData);
    const workpermitFileName = await generateWorkPermitPDF(ContentData);
    console.log(workpermitFileName);
    const updatedPermit = await WorkPermit.findByIdAndUpdate(
      id,
      { $set: {
        workpermitstatus: "Released",
        transaction: paymentMethod,
        permitFile: workpermitFileName,
        permitDateIssued: new Date().toISOString(),
        permitExpiryDate: new Date(Date.now() + 31536000000).toISOString(),
        expiryDate: new Date(Date.now() + 31536000000).toISOString(),
        receipt: {
          receiptID: receiptID,
          modeOfPayment: paymentMethod,
          paymentType: paymentType,
          paymentNumber: accountNumber,
          receiptName: paymentName,
          receiptDate: new Date().toISOString(),
          amountPaid: amount,
          receiptFile: receiptFileName,
        }
      }
      }
    );
    if (!updatedPermit) {
      return res.status(404).json({ message: 'Work permit not found' });
    }
    res.json(updatedPermit);
  } catch (error) {
    console.error('Error updating work permit:', error);
    res.status(500).json({ error: 'Error updating work permit' });
  }
});

const generateReceiptPDF = (ContentData) => {
  const doc = new PDFDocument();
  const receiptFileName = `receipt_${Date.now()}.pdf`;
  const receiptPath = path.join(receiptsDir, receiptFileName);
  const writeStream = fs.createWriteStream(receiptPath);
  doc.pipe(writeStream);
  doc.fontSize(25).text('Receipt', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`);
  doc.text(`Receipt ID: ${ContentData.receiptID}`);
  doc.text(`Customer: ${ContentData.paymentName}`);
  doc.text(`Account Number: ${ContentData.accountNumber}`);
  doc.text(`Mode of Payment: ${ContentData.paymentMethod}`);
  doc.moveDown();
  doc.text(`Total Amount: ₱${ContentData.amount}`, { bold: true });
  doc.end();
  return receiptFileName;
};

const receiptsDir = path.join(__dirname, 'receipts');
if (!fs.existsSync(receiptsDir)) {
  fs.mkdirSync(receiptsDir);
}
router.use('/receipts', express.static(receiptsDir));

const workPermitsDir = path.join(__dirname, 'permits');
if (!fs.existsSync(workPermitsDir)) {
  fs.mkdirSync(workPermitsDir);
}
router.use('/permits', express.static(workPermitsDir));

const generateWorkPermitPDF = async (ContentData) => {
  const doc = new PDFDocument();
  const workPermitFileName = `workpermit_${ContentData.id}.pdf`;
  const workPermitPath = path.join(workPermitsDir, workPermitFileName);
  try {
    const workPermit = await WorkPermit.findById(ContentData.id);
    if (!workPermit) {
      throw new Error('Work permit not found');
    }
    const writeStream = fs.createWriteStream(workPermitPath);
    doc.pipe(writeStream);
    doc.fontSize(20).text('Work Permit', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Work Permit ID: ${workPermit._id}`);
    doc.text(`Issued To: ${workPermit.formData.personalInformation.firstName}`);
    doc.text(`Classification: ${workPermit.classification}`);
    doc.text(`Permit Status: Released`);
    doc.text(`Issue Date: ${new Date().toLocaleDateString()}`);
    doc.text(`Expiration Date: ${new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleString()}`);
    doc.end();
    console.log(`Work Permit PDF created at ${workPermitFileName}`);
    return workPermitFileName;
  } catch (error) {
    console.error('Error generating work permit PDF:', error);
    throw error;
  }
};

router.delete('/deletePermit/:permitId', async (req, res) => {
  const { permitId } = req.params;
  try {
    const result = await WorkPermit.deleteOne({ _id: permitId });
    if (result.deletedCount === 1) {
      return res.status(200).json({ message: "Permit deleted successfully" });
    } else {
      return res.status(404).json({ message: "Permit not found" });
    }
  } catch (error) {
    console.error("Error deleting permit:", error);
    return res.status(500).json({ message: "Error deleting permit", error });
  }
});

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

router.get('/chart/working-permits', async (req, res) => {
  try {
    const workingPermits = await WorkPermit.countDocuments();
    res.json({ label: 'Working Permit', count: workingPermits });
  } catch (error) {
    console.error('Error fetching working permit data:', error);
    res.status(500).json({ message: 'Error fetching working permit data' });
  }
});

router.get('/chart/business-permits', async (req, res) => {
  try {
    const businessPermits = await BusinessPermit.countDocuments();
    res.json({ label: 'Business Permit', count: businessPermits });
  } catch (error) {
    console.error('Error fetching business permit data:', error);
    res.status(500).json({ message: 'Error fetching business permit data' });
  }
});


// PUT endpoint to update the permit status (approve/reject)
router.put('/updatebusinesspermitstatus/:permitId', async (req, res) => {
  const { permitId } = req.params; // Extract permit ID from URL params
  const { status, remarks } = req.body; // Get the new status (approved/rejected)

  // Validate the status value
  if (!status || !['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value. It should be "approved" or "rejected".' });
  }

  // Define the new status based on approval or rejection
  let updatedStatus;
  if (status === 'approved') {
    updatedStatus = 'Waiting for Payment'; // Set the status to "Waiting for Payment" if approved
  } else if (status === 'rejected') {
    updatedStatus = 'Rejected'; // Set the status to "Rejected" if rejected
  }

  try {
    // Find the permit by ID and update the status and remarks
    const updatedPermit = await BusinessPermit.findByIdAndUpdate(
      permitId,
      { 
        businesspermitstatus: updatedStatus, // Update the status
        paymentstatus: 'Pending',
        applicationComments: remarks, // Update the remarks
      },
      { new: true } // Returns the updated document
    );

    if (!updatedPermit) {
      return res.status(404).json({ error: 'Permit not found.' });
    }

    // Respond with the updated permit data
    res.status(200).json({ message: 'Permit status updated successfully.', permit: updatedPermit });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error, please try again later.' });
  }
});

 router.get('/BusinessmonthlyPaymentStatus', async (req, res) => {
    try {
      const monthlyData = await BusinessPermit.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            },
            paid: {
              $sum: {
                $cond: [{ $eq: ["$workpermitstatus", "Paid"] }, 1, 0]
              }
            },
            unpaid: {
              $sum: {
                $cond: [{ $eq: ["$workpermitstatus", "Unpaid"] }, 1, 0]
              }
            }
          }
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1
          }
        },
        {
          $project: {
            _id: 0,
            month: {
              $concat: [
                { $arrayElemAt: [["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], "$_id.month"] },
                " ",
                { $toString: "$_id.year" }
              ]
            },
            paid: 1,
            unpaid: 1
          }
        }
      ]);
  
      res.json(monthlyData);
    } catch (error) {
      console.error('Error fetching monthly payment status:', error);
      res.status(500).json({ message: 'Error fetching monthly payment status' });
    }
  });

router.get('/work-permits/monthly-applications', async (req, res) => {
  try {
    const monthlyData = await WorkPermit.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $arrayElemAt: [["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], "$_id.month"] },
              " ",
              { $toString: "$_id.year" }
            ]
          },
          count: 1
        }
      }
    ]);

    res.json(monthlyData);
  } catch (error) {
    console.error('Error fetching monthly work permit applications:', error);
    res.status(500).json({ message: 'Error fetching monthly work permit applications' });
  }
});

router.get('/business-permits/monthly-applications', async (req, res) => {
  try {
    const monthlyData = await BusinessPermit.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $arrayElemAt: [["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], "$_id.month"] },
              " ",
              { $toString: "$_id.year" }
            ]
          },
          count: 1
        }
      }
    ]);

    res.json(monthlyData);
  } catch (error) {
    console.error('Error fetching monthly business permit applications:', error);
    res.status(500).json({ message: 'Error fetching monthly business permit applications' });
  }
});
// Endpoint for fetching the count of new working permits
router.get('/newWorkingpermits', async (req, res) => {
  try {
    const newPermitsCount = await WorkPermit.countDocuments({ classification: 'New' });
    const month = new Date().toLocaleString('default', { month: 'long' });
    res.json({ count: newPermitsCount });
  } catch (error) {
    console.error('Error fetching new working permits data:', error);
    res.status(500).json({ message: 'Error fetching new working permits data' });
  }
});

// Endpoint for fetching the count of renewal working permits
router.get('/renewalWorkingpermits', async (req, res) => {
  try {
    const renewalPermitsCount = await WorkPermit.countDocuments({ classification: 'Renewal' });
    const month = new Date().toLocaleString('default', { month: 'long' });
    res.json({ count: renewalPermitsCount });
  } catch (error) {
    console.error('Error fetching renewal working permits data:', error);
    res.status(500).json({ message: 'Error fetching renewal working permits data' });
  }
});

// Endpoint for fetching the count of new business permits
router.get('/newBusinesspermits', async (req, res) => {
  try {
    const newBusinessPermitsCount = await BusinessPermit.countDocuments({ classification: 'New' });
    const month = new Date().toLocaleString('default', { month: 'long' });
    res.json({ count: newBusinessPermitsCount });
  } catch (error) {
    console.error('Error fetching new business permits data:', error);
    res.status(500).json({ message: 'Error fetching new business permits data' });
  }
});

// Endpoint for fetching the count of renewal business permits
router.get('/renewalBusinesspermits', async (req, res) => {
  try {
    const renewalBusinessPermitsCount = await BusinessPermit.countDocuments({ classification: 'Renewal' });
    const month = new Date().toLocaleString('default', { month: 'long' });
    res.json({ count: renewalBusinessPermitsCount });
  } catch (error) {
    console.error('Error fetching renewal business permits data:', error);
    res.status(500).json({ message: 'Error fetching renewal business permits data' });
  }
});


// Endpoint for fetching the count of working permits
router.get('/workingpermitsChart', async (req, res) => {
  try {
    const workingPermits = await WorkPermit.countDocuments();
    const month = new Date().toLocaleString('default', { month: 'long' });
    res.json({ label: 'Working Permit', count: workingPermits });
  } catch (error) {
    console.error('Error fetching working permit data:', error);
    res.status(500).json({ message: 'Error fetching working permit data' });
  }
});

// Endpoint for fetching the count of business permits
router.get('/businesspermitsChart', async (req, res) => {
  try {
    const businessPermits = await BusinessPermit.countDocuments();
    const month = new Date().toLocaleString('default', { month: 'long' });
    res.json({ label: 'Business Permit', count: businessPermits });
  } catch (error) {
    console.error('Error fetching business permit data:', error);
    res.status(500).json({ message: 'Error fetching business permit data' });
  }
});

// For the Dashboard
router.get('/workpermitdatastats', async (req, res) => {
  try {
    const totalPermitApplications = await WorkPermit.countDocuments();
    const totalRenewalApplications = await WorkPermit.countDocuments({ classification: 'Renewal' });
    const totalCollections = await WorkPermit.aggregate([
      { $group: { _id: null, total: { $sum: "$amountPaid" } } }
    ]);
    const totalReleased = await WorkPermit.countDocuments({ workpermitstatus: 'Released' });

    res.json({
      totalPermitApplications,
      totalRenewalApplications,
      totalCollections: totalCollections[0]?.total || 0,
      totalReleased
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
});

// Endpoint to fetch dashboard data
router.get('/dashboardData', async (req, res) => {
  try {
    const totalWorkPermitApplications = await WorkPermit.countDocuments();
    const totalWorkRenewalApplications = await WorkPermit.countDocuments({ classification: 'Renewal' });
    const totalWorkCollections = await WorkPermit.aggregate([
      { $group: { _id: null, total: { $sum: "$amountPaid" } } }
    ]);
    const totalWorkReleased = await WorkPermit.countDocuments({ workpermitstatus: 'Released' });

    const totalBusinessPermitApplications = await BusinessPermit.countDocuments();
    const totalBusinessRenewalApplications = await BusinessPermit.countDocuments({ classification: 'Renewal' });
    const totalBusinessCollections = await BusinessPermit.aggregate([
      { $group: { _id: null, total: { $sum: "$amountPaid" } } }
    ]);
    const totalBusinessReleased = await BusinessPermit.countDocuments({ businesspermitstatus: 'Released' });

    res.json({
      totalWorkPermitApplications,
      totalWorkRenewalApplications,
      totalWorkCollections: totalWorkCollections[0]?.total || 0,
      totalWorkReleased,
      totalBusinessPermitApplications,
      totalBusinessRenewalApplications,
      totalBusinessCollections: totalBusinessCollections[0]?.total || 0,
      totalBusinessReleased
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
});

// Endpoint to fetch permit applications by category
router.get('/permitApplicationsByCategory', async (req, res) => {
  try {
    const workPermitCategories = await WorkPermit.aggregate([
      { $group: { _id: "$classification", count: { $sum: 1 } } }
    ]);

    const businessPermitCategories = await BusinessPermit.aggregate([
      { $group: { _id: "$classification", count: { $sum: 1 } } }
    ]);

    res.json({
      workPermitCategories,
      businessPermitCategories
    });
  } catch (error) {
    console.error('Error fetching permit applications by category:', error);
    res.status(500).json({ message: 'Error fetching permit applications by category' });
  }
});

router.post('/updatePassword', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Hash the new password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;