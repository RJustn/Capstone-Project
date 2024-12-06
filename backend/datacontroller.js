const express = require('express');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const cron = require('node-cron');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const { User, WorkPermit,BusinessPermit} = require('./Modals')
const multer = require('multer');


router.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Customize the filename
  }
});

const upload = multer({ storage: storage });


router.get('/getworkpermitsforassessment', async (req, res) => {
    try {
      // Query to find only work permits where workpermitstatus is 'pending'
      const pendingWorkPermits = await WorkPermit.find({ workpermitstatus: 'Pending' });
  
      // Send the filtered result as a JSON response
      res.json(pendingWorkPermits);
    } catch (error) {
      console.error('Error fetching work permits:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
  router.get('/getbusinesspermitsforassessment', async (req, res) => {
    try {
      // Query to find only work permits where workpermitstatus is 'pending'
      const pendingWorkPermits = await BusinessPermit.find({ businesspermitstatus: 'Pending' });
  
      // Send the filtered result as a JSON response
      res.json(pendingWorkPermits);
    } catch (error) {
      console.error('Error fetching work permits:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
  router.get('/getworkpermitsforpayments', async (req, res) => {
    try {
      // Query to find only work permits where workpermitstatus is 'pending'
      const pendingWorkPermits = await WorkPermit.find({ workpermitstatus: 'Waiting for Payment' });
  
      // Send the filtered result as a JSON response
      res.json(pendingWorkPermits);
    } catch (error) {
      console.error('Error fetching work permits:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
  router.get('/getworkpermitsforrelease', async (req, res) => {
    try {
      // Query to find work permits where workpermitstatus is 'Released' or 'Expired'
      const pendingWorkPermits = await WorkPermit.find({ workpermitstatus: { $in: ['Released', 'Expired'] } });
  
      // Send the filtered result as a JSON response
      res.json(pendingWorkPermits);
    } catch (error) {
      console.error('Error fetching work permits:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
  
  
  router.get('/DCworkpermitdetails/:id', async (req, res) => {
    const { id } = req.params;  // Extract the work permit ID from the route parameters
  
    try {
      // Find the work permit directly by its ID
      const workPermit = await WorkPermit.findById(id);
  
      if (!workPermit) {
        return res.status(404).json({ message: 'Work permit not found' });
      }
  
      // Return the work permit details
      res.json(workPermit);
    } catch (error) {
      console.error('Error retrieving work permit:', error);
      res.status(500).json({ message: 'Error retrieving work permit', error });
    }
  });

  router.get('/DCbusinesspermitdetails/:id', async (req, res) => {
    const { id } = req.params;  // Extract the work permit ID from the route parameters
  
    try {
      // Find the work permit directly by its ID
      const businessPermit = await BusinessPermit.findById(id);
  
      if (!businessPermit) {
        return res.status(404).json({ message: 'Work permit not found' });
      }
  
      // Return the work permit details
      res.json(businessPermit);
      console.log(businessPermit);
    } catch (error) {
      console.error('Error retrieving work permit:', error);
      res.status(500).json({ message: 'Error retrieving work permit', error });
    }
  });
  
  //Handle Update
  router.put('/work-permits/:id', async (req, res) => {
    console.log('Request body:', req.body); // Log incoming request body
    const { id } = req.params;
    const { status } = req.body; // Get relevant fields from request body
    const ContentData = {
      id: id,
    };
    try {
        let updateFields = {};
        
        // Check the status and set routerropriate fields
        if (status === 'Released') {
          const workpermitFileName = await generateWorkPermitPDF(ContentData);
            updateFields = {
                permitFile: workpermitFileName,
                transaction: 'First Time Job Seeker',
                permitDateIssued: new Date().toISOString(),
                workpermitstatus: status,
                permitExpiryDate: new Date(Date.now() + 31536000000).toISOString(), // 1 year from now
                expiryDate: new Date(Date.now() + 31536000000).toISOString(), // 1 year from now
  
            };
        } else if (status === 'Waiting for Payment') {
            updateFields = {
                workpermitstatus: status,
                permitExpiryDate: null, // No expiry date for this status
                expiryDate: new Date(Date.now() + 31536000000).toISOString(), // 1 year from now
            };
        } else {
            return res.status(400).json({ message: 'Invalid status' });
        }
  
        // Update the work permit
        const updatedPermit = await WorkPermit.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true } // Option to return the updated document
        );
  
        if (!updatedPermit) {
            return res.status(404).json({ message: 'Work permit not found' });
        }
  
        res.json(updatedPermit);
        console.log('Updated Permit:', updatedPermit); // Log updated permit for debugging
    } catch (error) {
        console.error('Error updating work permit:', error); // Log error
        res.status(500).json({ error: 'Error updating work permit' });
    }
  });
  
  
  
  router.put('/work-permitsreject/:id', async (req, res) => {
    console.log('Request body:', req.body); // Log incoming request body
    const { id } = req.params;
    const { status, comments } = req.body;
  
  
  
  
    try {
      const updatedPermit = await WorkPermit.findByIdAndUpdate(
        id,
        { 
          $set: {
            workpermitstatus: status,
            routerlicationComments: comments,
          }
        },
        { new: true } // Option to return the updated document
      );
  
      if (!updatedPermit) {
        return res.status(404).json({ message: 'Work permit not found' });
      }
  
      res.json(updatedPermit);
      console.log(new Date(Date.now() + 31536000000)); // Correct syntax)
    } catch (error) {
      console.error('Error updating work permit:', error); // Log error
      res.status(500).json({ error: 'Error updating work permit' });
    }
  });
  
  
  
  router.put('/handlepayments/:id', async (req, res) => {
    
    console.log('Request params:', req.params); // Log incoming request body
    console.log('Request body:', req.body); 
    const { id, }= req.params;
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
      console.error('Error updating work permit:', error); // Log error
      res.status(500).json({ error: 'Error updating work permit' });
    }
  });
  
  
  
  
  // Function to generate PDF
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
  
  
  // Directory for work permit PDFs
  const generateWorkPermitPDF = async (ContentData) => {
    const doc = new PDFDocument();
    const workPermitFileName = `workpermit_${ContentData.id}.pdf`;  // File name based on the ID
    const workPermitPath = path.join(workPermitsDir, workPermitFileName);
  
    try {
        // Fetch the work permit data by ID
        const workPermit = await WorkPermit.findById(ContentData.id);
  
        if (!workPermit) {
            throw new Error('Work permit not found');
        }
  
  
        const writeStream = fs.createWriteStream(workPermitPath);
        doc.pipe(writeStream);
        // Add content to the PDF
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
  
        return workPermitFileName;  // Return the path to the generated PDF
    } catch (error) {
        console.error('Error generating work permit PDF:', error);
        throw error;
    }
  };
  
  
  // Delete permit route
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
    // Get current date in UTC
    const currentDate = new Date(Date.now()).toISOString(); // Current date in UTC
    console.log(`Current Date (UTC): ${currentDate}`);
  
    try {
      // Find permits that should be marked as expired
      const permits = await WorkPermit.find({
        permitExpiryDate: { $lte: currentDate }, // Compare expiryDate with currentDate in UTC
        workpermitstatus: { $ne: 'Expired' }     // Exclude already expired permits
      });
  
      permits.forEach(permit => {
        console.log(`Checking Permit: ${permit._id}`);
        console.log(`Permit Expiry Date (UTC): ${permit.permitExpiryDate}, Current Date (UTC): ${currentDate}`);
      });
  
      const result = await WorkPermit.updateMany(
        {
          permitExpiryDate: { $lte: currentDate }, // Compare full date and time in UTC
          workpermitstatus: { $ne: 'Expired' }     // Exclude already expired permits
        },
        { $set: { workpermitstatus: 'Expired' } } // Mark as expired
      );
  
      console.log(`${result.modifiedCount} work permits have been updated to expired.`);
    } catch (error) {
      console.error('Error updating expired work permits:', error);
    }
  };
  
  
  
  
  // Schedule a job to run every day at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running scheduled job to check for expired work permits.');
    await checkExpired(); // Call the function to check for expired permits
  });
  

router.put('/updateworkingPermit/:id', async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body; // Updated fields from frontend

  try {
    const updatedPermit = await WorkPermit.findByIdAndUpdate( // Corrected model
      id,
      { $set: updatedData }, // Use $set to update only specified fields
      { new: true, runValidators: true } // Return updated document and validate schema
    );

    if (!updatedPermit) {
      return res.status(404).json({ error: 'Permit not found' });
    }

    res.status(200).json(updatedPermit);
  } catch (error) {
    console.error('Error updating permit:', error);
    res.status(500).json({ error: 'Failed to update permit' });
  }
});

  router.put('/updatebusinessownerPermit/:id', async (req, res) => {
    const { id } = req.params;
    const updatedData = req.body; // Updated fields from frontend
  
    try {
      const updatedPermit = await BusinessPermit.findByIdAndUpdate(
        id,
        { $set: updatedData }, // Use $set to update only specified fields
        { new: true, runValidators: true } // Return updated document and validate schema
      );
  
      if (!updatedPermit) {
        return res.status(404).json({ error: 'Permit not found' });
      }
  
      res.status(200).json(updatedPermit);
    } catch (error) {
      console.error('Error updating permit:', error);
      res.status(500).json({ error: 'Failed to update permit' });
    }
  });

  router.put('/updatebusinessinfoPermit/:id', async (req, res) => {
    const { id } = req.params;
    const updatedData = req.body; // Updated fields from frontend
  
    try {
      const updatedPermit = await BusinessPermit.findByIdAndUpdate(
        id,
        { $set: updatedData }, // Use $set to update only specified fields
        { new: true, runValidators: true } // Return updated document and validate schema
      );
  
      if (!updatedPermit) {
        return res.status(404).json({ error: 'Permit not found' });
      }
  
      res.status(200).json(updatedPermit);
    } catch (error) {
      console.error('Error updating permit:', error);
      res.status(500).json({ error: 'Failed to update permit' });
    }
  });


  // Route to update business permit documents
router.post('/updatebusinessattachment/:id', upload.fields([
  { name: 'document1', maxCount: 1 },
  { name: 'document2', maxCount: 1 },
  { name: 'document3', maxCount: 1 },
  { name: 'document4', maxCount: 1 },
  { name: 'document5', maxCount: 1 },
  { name: 'document6', maxCount: 1 },
]), async (req, res) => {
  try {
    const permitId = req.params.id;
    const files = req.files;
    const { remarksdoc1, remarksdoc2, remarksdoc3, remarksdoc4, remarksdoc5, remarksdoc6} = req.body; // Extract remarks from the request body

    if (!permitId) {
      return res.status(400).json({ message: 'Permit ID is required' });
    }

    const updates = {};

    // Update each document field if a new file is uploaded
    if (files.document1) updates['files.document1'] = files.document1[0].filename;
    if (files.document2) updates['files.document2'] = files.document2[0].filename;
    if (files.document3) updates['files.document3'] = files.document3[0].filename;
    if (files.document4) updates['files.document4'] = files.document4[0].filename;
    if (files.document5) updates['files.document5'] = files.document5[0].filename;
    if (files.document6) updates['files.document6'] = files.document6[0].filename;

    if (remarksdoc1) updates['files.remarksdoc1'] = remarksdoc1;
    if (remarksdoc2) updates['files.remarksdoc2'] = remarksdoc2;
    if (remarksdoc3) updates['files.remarksdoc3'] = remarksdoc3;
    if (remarksdoc4) updates['files.remarksdoc4'] = remarksdoc4;
    if (remarksdoc5) updates['files.remarksdoc5'] = remarksdoc5;
    if (remarksdoc6) updates['files.remarksdoc6'] = remarksdoc6;

    // Update the MongoDB document
    const updatedPermit = await BusinessPermit.findByIdAndUpdate(
      permitId,
      { $set: updates },
      { new: true } // Return the updated document
    );

    res.status(200).json({
      message: 'Business permit updated successfully',
      updatedPermit,
    });
  } catch (error) {
    console.error('Error updating permit:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/updatebusinessnature/:id', async (req, res) => {
  const { id } = req.params;
  const { businesses, deletedIds } = req.body;

  try {
    const permit = await BusinessPermit.findById(id);

    if (!permit) {
      return res.status(404).json({ message: 'Business permit not found' });
    }

    // Remove deleted businesses
    permit.businesses = permit.businesses.filter(
      (business) => !deletedIds.includes(business._id.toString())
    );

    // Update existing businesses or add new ones
    businesses.forEach((business) => {
      const index = permit.businesses.findIndex(
        (b) => b._id.toString() === business._id
      );

      if (index !== -1) {
        // Update existing business
        permit.businesses[index] = business;
      } else {
        // Add new business
        permit.businesses.push(business);
      }
    });

    await permit.save();

    res.status(200).json({ message: 'Businesses updated successfully', data: permit });
  } catch (error) {
    console.error('Database update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/updateworkpermitattachments/:id', upload.fields([
  { name: 'document1', maxCount: 1 },
  { name: 'document2', maxCount: 1 },
  { name: 'document3', maxCount: 1 },
  { name: 'document4', maxCount: 1 },
]), async (req, res) => {
  try {
    const permitId = req.params.id;
    const files = req.files;
    const { remarksdoc1, remarksdoc2, remarksdoc3, remarksdoc4 } = req.body; // Extract remarks from the request body

    if (!permitId) {
      console.error('Permit ID is required');
      return res.status(400).json({ message: 'Permit ID is required' });
    }

    const updates = {};

    // Update each document field if a new file is uploaded
    if (files.document1) updates['files.document1'] = files.document1[0].filename;
    if (files.document2) updates['files.document2'] = files.document2[0].filename;
    if (files.document3) updates['files.document3'] = files.document3[0].filename;
    if (files.document4) updates['files.document4'] = files.document4[0].filename;

    if (remarksdoc1) updates['files.remarksdoc1'] = remarksdoc1;
    if (remarksdoc2) updates['files.remarksdoc2'] = remarksdoc2;
    if (remarksdoc3) updates['files.remarksdoc3'] = remarksdoc3;
    if (remarksdoc4) updates['files.remarksdoc4'] = remarksdoc4;

    console.log('Permit ID:', permitId); // Log permit ID
    console.log('Files:', files); // Log files
    console.log('Remarks:', { remarksdoc1, remarksdoc2, remarksdoc3, remarksdoc4 }); // Log remarks
    console.log('Updates:', updates); // Log updates for debugging

    // Update the MongoDB document
    const updatedPermit = await WorkPermit.findByIdAndUpdate(
      permitId,
      { $set: updates },
      { new: true }
    );

    if (!updatedPermit) {
      console.error('Work permit not found');
      return res.status(404).json({ message: 'Work permit not found' });
    }

    console.log('Updated Permit:', updatedPermit); // Log the updated permit

    res.status(200).json({
      message: 'Work permit updated successfully',
      updatedPermit,
    });
  } catch (error) {
    console.error('Error updating permit:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Endpoint for fetching the count of new working permits
router.get('/newWorkingpermits', async (req, res) => {
  try {
    const newPermitsCount = await WorkPermit.countDocuments({ classification: 'New' });
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
    res.json({ label: 'Business Permit', count: businessPermits });
  } catch (error) {
    console.error('Error fetching business permit data:', error);
    res.status(500).json({ message: 'Error fetching business permit data' });
  }
});

// For the 
// router.get('/dashboard/workpermitdata', async (req, res) => {
//   try {
//     const totalPermitApplications = await WorkPermit.countDocuments();
//     const totalRenewalApplications = await WorkPermit.countDocuments({ classification: 'Renewal' });
//     const totalCollections = await WorkPermit.aggregate([
//       { $group: { _id: null, total: { $sum: "$amountPaid" } } }
//     ]);
//     const totalReleased = await WorkPermit.countDocuments({ workpermitstatus: 'Released' });

//     res.json({
//       totalPermitApplications,
//       totalRenewalApplications,
//       totalCollections: totalCollections[0]?.total || 0,
//       totalReleased
//     });
//   } catch (error) {
//     console.error('Error fetching dashboard stats:', error);
//     res.status(500).json({ message: 'Error fetching dashboard stats' });
//   }
// });

  module.exports = router;