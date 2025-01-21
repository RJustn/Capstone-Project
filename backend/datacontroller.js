const express = require('express');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const jwt = require('jsonwebtoken');
const cron = require('node-cron');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const { User, WorkPermit,BusinessPermit} = require('./Modals')
const multer = require('multer');
const JWT_SECRET = 'your_jwt_secret'; 

router.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Customize the filename
  }
});

const receiptstorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'receipts/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Customize the filename
  }
});

const upload = multer({ storage: storage });
const receipt = multer({ storage: receiptstorage });



router.get('/getworkpermitsforassessment/:type', async (req, res) => {
    try {
      const { type } = req.params;  // Extract the work permit ID from the route parameters
      let filters = { workpermitstatus: { $in: ['Pending'] } };
      // Query to find only work permits where workpermitstatus is 'pending'
        
      if (type === 'new') {
        filters.classification = 'New'; // Filter for New Business classification
      } else if (type === 'renew') {
        filters.classification = 'Renew'; // Filter for Renew Business classification
      } else if (type === 'all') {
        // Clear classification filter if "all" is selected
        delete filters.classification; // Show all classifications
      }
      console.log('Filters being applied:', filters);
      const pendingWorkPermits = await WorkPermit.find(filters);
  
      // Send the filtered result as a JSON response
      res.json(pendingWorkPermits);
    } catch (error) {
      console.error('Error fetching work permits:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
  router.get('/getbusinesspermitsforassessment/:type', async (req, res) => {
    try {
     
      const { type } = req.params;  // Extract the work permit ID from the route parameters
  console.log(type);
      // Define filters for "Pending" or "Assessed" status
      let filters = { businesspermitstatus: { $in: ['Pending', 'Assessed'] } };
  
      if (type === 'new') {
        filters.classification = 'NewBusiness'; // Filter for New Business classification
      } else if (type === 'renew') {
        filters.classification = 'RenewBusiness'; // Filter for Renew Business classification
      } else if (type === 'all') {
        // Clear classification filter if "all" is selected
        delete filters.classification; // Show all classifications
      }
      console.log('Filters being applied:', filters);
  
      const permits = await BusinessPermit.find(filters);
  
      res.json(permits);
    } catch (error) {
      console.error('Error fetching business permits:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
  
  router.get('/getworkpermitsforpayments/:type', async (req, res) => {
    try {
      const { type } = req.params;  // Extract the work permit ID from the route parameters
      let filters = { workpermitstatus: { $in: ['Waiting for Payment'] } };
      // Query to find only work permits where workpermitstatus is 'pending'
        
      if (type === 'new') {
        filters.classification = 'New'; // Filter for New Business classification
      } else if (type === 'renew') {
        filters.classification = 'Renew'; // Filter for Renew Business classification
      } else if (type === 'all') {
        // Clear classification filter if "all" is selected
        delete filters.classification; // Show all classifications
      }
      console.log('Filters being applied:', filters);
      const forPaymentsWorkPermits = await WorkPermit.find(filters);
  
      // Send the filtered result as a JSON response
      res.json(forPaymentsWorkPermits);
    } catch (error) {
      console.error('Error fetching work permits:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  

  router.get('/getbusinesspermitsforpayments/:type', async (req, res) => {
    try {
     
      const { type } = req.params;  // Extract the work permit ID from the route parameters
  console.log(type);
      // Define filters for "Pending" or "Assessed" status
      let filters = { businesspermitstatus: { $in: ['Waiting for Payment'] } };
  
      if (type === 'new') {
        filters.classification = 'NewBusiness'; // Filter for New Business classification
      } else if (type === 'renew') {
        filters.classification = 'RenewBusiness'; // Filter for Renew Business classification
      } else if (type === 'all') {
        // Clear classification filter if "all" is selected
        delete filters.classification; // Show all classifications
      }
      console.log('Filters being applied:', filters);
  
      const permits = await BusinessPermit.find(filters);
  
      res.json(permits);
    } catch (error) {
      console.error('Error fetching business permits:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
  router.get('/getworkpermitsrelease/:type', async (req, res) => {
    try {
      const { type } = req.params;  // Extract the work permit ID from the route parameters
      let filters = { workpermitstatus: { $in: ['Released', 'Expired'] } };
      // Query to find only work permits where workpermitstatus is 'pending'
        
      if (type === 'new') {
        filters.classification = 'New'; // Filter for New Business classification
      } else if (type === 'renew') {
        filters.classification = 'Renew'; // Filter for Renew Business classification
      } else if (type === 'all') {
        // Clear classification filter if "all" is selected
        delete filters.classification; // Show all classifications
      }
      console.log('Filters being applied:', filters);
      const forPaymentsWorkPermits = await WorkPermit.find(filters);
  
      // Send the filtered result as a JSON response
      res.json(forPaymentsWorkPermits);
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

  router.get('/getbusinesspermitsforrelease/:type', async (req, res) => {
    try {
     
      const { type } = req.params;  // Extract the work permit ID from the route parameters
  console.log(type);
      // Define filters for "Pending" or "Assessed" status
      let filters = { businesspermitstatus: { $in: ['Released'] } };
  
      if (type === 'new') {
        filters.classification = 'NewBusiness'; // Filter for New Business classification
      } else if (type === 'renew') {
        filters.classification = 'RenewBusiness'; // Filter for Renew Business classification
      } else if (type === 'all') {
        // Clear classification filter if "all" is selected
        delete filters.classification; // Show all classifications
      }
      console.log('Filters being applied:', filters);
  
      const permits = await BusinessPermit.find(filters);
  
      res.json(permits);
    } catch (error) {
      console.error('Error fetching business permits:', error);
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

  router.get('/getbusinesspermitsforretire/', async (req, res) => {
    try {
     
  

      // Define filters for "Pending" or "Assessed" status
      let filters = { forretirement: { $in: ['ForRetire', 'RetiredBusiness'] } };
  
      console.log('Filters being applied:', filters);
  
      const permits = await BusinessPermit.find(filters);
  
      res.json(permits);
    } catch (error) {
      console.error('Error fetching business permits:', error);
      res.status(500).json({ message: 'Internal Server Error' });
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
          const workpermitFileName = await generateWorkPermitPDF(id);
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
                transaction: 'Waiting',
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
  
    // Function to generate Statement of Account PDF
    const generateStatementofAccount = (ContentData, BusinessPermitContent) => {
      const doc = new PDFDocument();
      const receiptFileName = `statementofaccount_${Date.now()}.pdf`;
      const receiptPath = path.join(receiptsDir, receiptFileName);
  
      const writeStream = fs.createWriteStream(receiptPath);
      doc.pipe(writeStream);
      doc.fontSize(25).text('Statement of Account', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`);
      doc.text(`Receipt ID: ${uuidv4()}`);
      doc.text(`Business Owner: ${BusinessPermitContent.owner.lastname} ${BusinessPermitContent.owner.firstname}`);
      doc.text(`Business Permit ID: ${BusinessPermitContent.id}`);
      doc.text(`Mode of Payment: ${BusinessPermitContent.business.paymentmethod}`);
      doc.moveDown();
      doc.text(`Total Amount: ₱${ContentData.total}`, { bold: true });
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
  const generateWorkPermitPDF = async (id) => {
    const doc = new PDFDocument();
    const workPermitFileName = `workpermit_${id}.pdf`;  // File name based on the ID
    const workPermitPath = path.join(workPermitsDir, workPermitFileName);
  
    try {
        // Fetch the work permit data by ID
        const workPermit = await WorkPermit.findById(id);
  
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

  router.delete('/deletePermitBusiness/:permitId', async (req, res) => {
    const { permitId } = req.params;
  
    try {
      const result = await BusinessPermit.deleteOne({ _id: permitId });
  
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

//Compute Tax
const computeTax = (businessNature, capitalInvestment, classification) => {
if (!classification){
return null;
}
  const conditions = [
    {//Bank
      category: 'BNK',
      check: (businessNature) => businessNature.startsWith('BNK'),
      taxCalculation: (capitalInvestment, classification) => {
        if (classification === 'NewBusiness') {
      // Tax for new businesses
      const tax = Math.max(220, capitalInvestment * 0.0005); // 1/20th of 1% of capital investment
      return tax;
        }
        if(classification === 'RenewBusiness'){
        // Bank-specific tax rules for renew businesses
        if (capitalInvestment <= 1000000) {
          return capitalInvestment * 0.00605; // 60.5% of 1%
        } else {
          return capitalInvestment * 0.005808; // 58.08% of 1%
        }
        }
      },
    },
    {//Contractor
      category: 'CNT',
      check: (businessNature) => businessNature.startsWith('CNT'),
      taxCalculation: (capitalInvestment, classification) => {
        if (classification === 'NewBusiness') {
          // Tax for new businesses
          const tax = Math.max(220, capitalInvestment * 0.0005); // 1/20th of 1% of capital investment
          return tax;
            }
        if (classification === 'RenewBusiness') {
          // Tax computation for new businesses in the CNT category
          if (capitalInvestment < 5000) {
            return 33.0;
          } else if (capitalInvestment >= 5000 && capitalInvestment < 10000) {
            return 74.54;
          } else if (capitalInvestment >= 10000 && capitalInvestment < 15000) {
            return 126.45;
          } else if (capitalInvestment >= 15000 && capitalInvestment < 20000) {
            return 199.65;
          } else if (capitalInvestment >= 20000 && capitalInvestment < 30000) {
            return 332.75;
          } else if (capitalInvestment >= 30000 && capitalInvestment < 40000) {
            return 465.85;
          } else if (capitalInvestment >= 40000 && capitalInvestment < 50000) {
            return 665.5;
          } else if (capitalInvestment >= 50000 && capitalInvestment < 75000) {
            return 1064.8;
          } else if (capitalInvestment >= 75000 && capitalInvestment < 100000) {
            return 1597.2;
          } else if (capitalInvestment >= 100000 && capitalInvestment < 150000) {
            return 2395.8;
          } else if (capitalInvestment >= 150000 && capitalInvestment < 200000) {
            return 3194.4;
          } else if (capitalInvestment >= 200000 && capitalInvestment < 250000) {
            return 4392.3;
          } else if (capitalInvestment >= 250000 && capitalInvestment < 300000) {
            return 5590.2;
          } else if (capitalInvestment >= 300000 && capitalInvestment < 400000) {
            return 7453.6;
          } else if (capitalInvestment >= 400000 && capitalInvestment < 500000) {
            return 9982.5;
          } else if (capitalInvestment >= 500000 && capitalInvestment < 750000) {
            return 11192.5;
          } else if (capitalInvestment >= 750000 && capitalInvestment < 1000000) {
            return 12402.5;
          } else if (capitalInvestment >= 1000000 && capitalInvestment < 2000000) {
            return 13915.0;
          } else if (capitalInvestment >= 2000000) {
            return capitalInvestment * 0.00605; // 60.5% of 1%
          }
        }

        
        console.log(`CNT: Classification "${classification}" not matched`);
        return 0; // Default to no tax for other classifications or unmatched conditions
      },
      
    },
    {//Lessor
      category: 'LSS',
      check: (businessNature) => businessNature.startsWith('LSS'),
      taxCalculation: (capitalInvestment, classification) => {
        if (classification === 'NewBusiness') {
          // Tax for new businesses
          const tax = Math.max(220, capitalInvestment * 0.0005); // 1/20th of 1% of capital investment
          return tax;
            }
        if (classification === 'RenewBusiness') {
          // Tax computation for new businesses in the LSS category
          if (capitalInvestment < 5000) {
            return 302.50;
          } else if (capitalInvestment >= 5000 && capitalInvestment < 10000) {
            return 363.00;
          } else if (capitalInvestment >= 10000 && capitalInvestment < 20000) {
            return 544.50;
          } else if (capitalInvestment >= 20000 && capitalInvestment < 30000) {
            return 665.50;
          } else if (capitalInvestment >= 30000 && capitalInvestment < 40000) {
            return 726.00;
          } else if (capitalInvestment >= 40000 && capitalInvestment < 50000) {
            return 907.50;
          } else if (capitalInvestment >= 50000) {
            // For every 5,000 in excess of 50,000, add 24.20
            const excess = Math.floor((capitalInvestment - 50000) / 5000);
            return 907.50 + (excess * 24.20);
          }
        }
        return 0; // Default to no tax for other classifications or unmatched conditions
      },
    },
    {//Manufacturer Non-Essential
      category: 'MFRP_MILL',
      check: (businessNature) => 
        businessNature.startsWith('MFRP') || businessNature.startsWith('MILL'),
      taxCalculation: (capitalInvestment, classification) => {    
        if (classification === 'NewBusiness') {
          // Tax for new businesses
          const tax = Math.max(220, capitalInvestment * 0.0005); // 1/20th of 1% of capital investment
          return tax;
            }
        if (classification === 'RenewBusiness') {
          if (capitalInvestment < 10000) {
            return 199.65;
          } else if (capitalInvestment >= 10000 && capitalInvestment < 15000) {
            return 266.20;
          } else if (capitalInvestment >= 15000 && capitalInvestment < 20000) {
            return 365.20;
          } else if (capitalInvestment >= 20000 && capitalInvestment < 30000) {
            return 532.40;
          } else if (capitalInvestment >= 30000 && capitalInvestment < 40000) {
            return 798.60;
          } else if (capitalInvestment >= 40000 && capitalInvestment < 50000) {
            return 998.25;
          } else if (capitalInvestment >= 50000 && capitalInvestment < 75000) {
            return 1597.20;
          } else if (capitalInvestment >= 75000 && capitalInvestment < 100000) {
            return 1996.50;
          } else if (capitalInvestment >= 100000 && capitalInvestment < 150000) {
            return 2662.00;
          } else if (capitalInvestment >= 150000 && capitalInvestment < 200000) {
            return 3327.50;
          } else if (capitalInvestment >= 200000 && capitalInvestment < 300000) {
            return 4658.50;
          } else if (capitalInvestment >= 300000 && capitalInvestment < 500000) {
            return 6655.00;
          } else if (capitalInvestment >= 500000 && capitalInvestment < 750000) {
            return 9680.00;
          } else if (capitalInvestment >= 750000 && capitalInvestment < 1000000) {
            return 12100.00;
          } else if (capitalInvestment >= 1000000 && capitalInvestment < 2000000) {
            return 16637.50;
          } else if (capitalInvestment >= 2000000 && capitalInvestment < 3000000) {
            return 19965.00;
          } else if (capitalInvestment >= 3000000 && capitalInvestment < 4000000) {
            return 23958.00;
          } else if (capitalInvestment >= 4000000 && capitalInvestment < 5000000) {
            return 27951.00;
          } else if (capitalInvestment >= 5000000 && capitalInvestment < 6500000) {
            return 29493.75;
          } else if (capitalInvestment >= 6500000) {
            return capitalInvestment * 0.0045; // 45% of 1%
          }
        }
        return 0; // Default to no tax for other classifications or unmatched conditions
      },
    },
    {//Manufacturer Essential
      category: 'MFRP',
      check: (businessNature) => businessNature.startsWith('MFRP'),
      taxCalculation: (capitalInvestment, classification) => {
        if (classification === 'NewBusiness') {
          // Tax for new businesses
          const tax = Math.max(220, capitalInvestment * 0.0005); // 1/20th of 1% of capital investment
          return tax;
            }
        if (classification === 'RenewBusiness') {
          if (capitalInvestment < 10000) {
            return 99.83;
          } else if (capitalInvestment >= 10000 && capitalInvestment < 15000) {
            return 133.10;
          } else if (capitalInvestment >= 15000 && capitalInvestment < 20000) {
            return 182.71;
          } else if (capitalInvestment >= 20000 && capitalInvestment < 30000) {
            return 266.20;
          } else if (capitalInvestment >= 30000 && capitalInvestment < 40000) {
            return 399.30;
          } else if (capitalInvestment >= 40000 && capitalInvestment < 50000) {
            return 499.13;
          } else if (capitalInvestment >= 50000 && capitalInvestment < 75000) {
            return 798.60;
          } else if (capitalInvestment >= 75000 && capitalInvestment < 100000) {
            return 998.25;
          } else if (capitalInvestment >= 100000 && capitalInvestment < 150000) {
            return 1331.00;
          } else if (capitalInvestment >= 150000 && capitalInvestment < 200000) {
            return 1663.75;
          } else if (capitalInvestment >= 200000 && capitalInvestment < 300000) {
            return 2329.25;
          } else if (capitalInvestment >= 300000 && capitalInvestment < 500000) {
            return 3327.50;
          } else if (capitalInvestment >= 500000 && capitalInvestment < 750000) {
            return 4840.00;
          } else if (capitalInvestment >= 750000 && capitalInvestment < 1000000) {
            return 6050.00;
          } else if (capitalInvestment >= 1000000 && capitalInvestment < 2000000) {
            return 8318.75;
          } else if (capitalInvestment >= 2000000 && capitalInvestment < 3000000) {
            return 9982.50;
          } else if (capitalInvestment >= 3000000 && capitalInvestment < 4000000) {
            return 11979.00;
          } else if (capitalInvestment >= 4000000 && capitalInvestment < 5000000) {
            return 13915.00;
          } else if (capitalInvestment >= 5000000 && capitalInvestment < 6500000) {
            return 14746.88;
          } else if (capitalInvestment >= 6500000) {
            return 0.2255 * 0.01 * capitalInvestment; // 22.55% of 1% for capital investment greater than or equal to 6,500,000
          }
        }
        return 0; // Default to no tax for other classifications or unmatched conditions
      }
    },    
    {//Proprietors Amusement Devices
      category: 'PRA',
      check: (businessNature) => businessNature.startsWith('PRA'),
      taxCalculation: (capitalInvestment, classification) => {
        if (classification === 'NewBusiness') {
          // Tax for new businesses
          const tax = Math.max(220, capitalInvestment * 0.0005); // 1/20th of 1% of capital investment
          return tax;
            }
        if (classification === 'RenewBusiness') {
          if (capitalInvestment < 10000) {
            return capitalInvestment * 0.0121; // 1.21%
          } else {
            return capitalInvestment * 0.00605; // 60.50% of 1%
          }
        }
        return 0; // Default to no tax for other classifications
      }
    },
    {//Retailer Tobaco
      category: 'RTLT',
      check: (businessNature) => businessNature.startsWith('RTLT'),
      taxCalculation: (capitalInvestment, classification) => {
        if (classification === 'NewBusiness') {
          // Tax for new businesses
          const tax = Math.max(220, capitalInvestment * 0.0005); // 1/20th of 1% of capital investment
          return tax;
            }
        if (classification === 'RenewBusiness') {
          if (capitalInvestment < 5000) {
            return 33.28;
          } else if (capitalInvestment >= 5000 && capitalInvestment < 10000) {
            return 74.54;
          } else if (capitalInvestment >= 10000 && capitalInvestment < 15000) {
            return 126.45;
          } else if (capitalInvestment >= 15000 && capitalInvestment < 20000) {
            return 199.65;
          } else if (capitalInvestment >= 20000 && capitalInvestment < 30000) {
            return 332.75;
          } else if (capitalInvestment >= 30000 && capitalInvestment < 40000) {
            return 465.85;
          } else if (capitalInvestment >= 40000 && capitalInvestment < 50000) {
            return 665.50;
          } else if (capitalInvestment >= 50000 && capitalInvestment < 75000) {
            return 1064.80;
          } else if (capitalInvestment >= 75000 && capitalInvestment < 100000) {
            return 1597.20;
          } else if (capitalInvestment >= 100000 && capitalInvestment < 1000000) {
            return capitalInvestment * 0.0121; // 1.21%
          } else if (capitalInvestment >= 1000000) {
            return capitalInvestment * 0.00605; // 60.50% of 1%
          }
        }
        return 0; // Default to no tax for other classifications
      }
    },
    {//Retailer Essential
      category: 'RTLE',
      check: (businessNature) => businessNature.startsWith('RTLE'),
      taxCalculation: (capitalInvestment, classification) => {
        if (classification === 'NewBusiness') {
          // Tax for new businesses
          const tax = Math.max(220, capitalInvestment * 0.0005); // 1/20th of 1% of capital investment
          return tax;
            }
        if (classification === 'RenewBusiness') {
          if (capitalInvestment < 400000) {
            return capitalInvestment * 0.0121; // 1.21%
          } else if (capitalInvestment >= 400000) {
            return capitalInvestment * 0.00605; // 60.50% of 1%
          }
        }
        return 0; // Default to no tax for other classifications
      }
    },
    {//Retailer Liquors
      category: 'RTLL',
      check: (businessNature) => businessNature.startsWith('RTLL'),
      taxCalculation: (capitalInvestment, classification) => {
        if (classification === 'NewBusiness') {
          // Tax for new businesses
          const tax = Math.max(220, capitalInvestment * 0.0005); // 1/20th of 1% of capital investment
          return tax;
            }
        if (classification === 'RenewBusiness') {
          if (capitalInvestment < 5000) {
            return 33.28;
          } else if (capitalInvestment >= 5000 && capitalInvestment < 10000) {
            return 74.54;
          } else if (capitalInvestment >= 10000 && capitalInvestment < 15000) {
            return 126.45;
          } else if (capitalInvestment >= 15000 && capitalInvestment < 20000) {
            return 199.65;
          } else if (capitalInvestment >= 20000 && capitalInvestment < 30000) {
            return 332.75;
          } else if (capitalInvestment >= 30000 && capitalInvestment < 40000) {
            return 465.85;
          } else if (capitalInvestment >= 40000 && capitalInvestment < 50000) {
            return 665.50;
          } else if (capitalInvestment >= 50000 && capitalInvestment < 75000) {
            return 1064.80;
          } else if (capitalInvestment >= 75000 && capitalInvestment < 100000) {
            return 1597.20;
          } else if (capitalInvestment >= 100000 && capitalInvestment < 1000000) {
            return capitalInvestment * 0.0121; // 1.21%
          } else if (capitalInvestment >= 1000000) {
            return capitalInvestment * 0.00605; // 60.50% of 1%
          }
        }
        return 0; // Default to no tax for other classifications or unmatched conditions
      }
    },
    {//Retailer Non-Essential
      category: 'RTLN',
      check: (businessNature) => businessNature.startsWith('RTLN'),
      taxCalculation: (capitalInvestment, classification) => {
        if (classification === 'NewBusiness') {
          // Tax for new businesses
          const tax = Math.max(220, capitalInvestment * 0.0005); // 1/20th of 1% of capital investment
          return tax;
            }
        if (classification === 'RenewBusiness') {
          if (capitalInvestment <= 400000) {
            return capitalInvestment * 0.0242; // 2.42% of the capital investment
          } else if (capitalInvestment > 400000) {
            return capitalInvestment * 0.0121; // 1.21% of the capital investment
          }
        }
        return 0; // Default to no tax for other classifications or unmatched conditions
      }
    },
    {//Wholesaler Non-Essential
      category: 'WHN',
      check: (businessNature) => businessNature.startsWith('WHN'),
      taxCalculation: (capitalInvestment, classification) => {
        if (classification === 'NewBusiness') {
          // Tax for new businesses
          const tax = Math.max(220, capitalInvestment * 0.0005); // 1/20th of 1% of capital investment
          return tax;
            }
        if (classification === 'RenewBusiness') {
          if (capitalInvestment < 1000) {
            return 21.78;
          } else if (capitalInvestment >= 1000 && capitalInvestment < 2000) {
            return 39.93;
          } else if (capitalInvestment >= 2000 && capitalInvestment < 3000) {
            return 60.50;
          } else if (capitalInvestment >= 3000 && capitalInvestment < 4000) {
            return 87.12;
          } else if (capitalInvestment >= 4000 && capitalInvestment < 5000) {
            return 121.00;
          } else if (capitalInvestment >= 5000 && capitalInvestment < 6000) {
            return 146.21;
          } else if (capitalInvestment >= 6000 && capitalInvestment < 7000) {
            return 173.03;
          } else if (capitalInvestment >= 7000 && capitalInvestment < 8000) {
            return 199.65;
          } else if (capitalInvestment >= 8000 && capitalInvestment < 10000) {
            return 226.27;
          } else if (capitalInvestment >= 10000 && capitalInvestment < 15000) {
            return 266.20;
          } else if (capitalInvestment >= 15000 && capitalInvestment < 20000) {
            return 332.75;
          } else if (capitalInvestment >= 20000 && capitalInvestment < 30000) {
            return 399.30;
          } else if (capitalInvestment >= 30000 && capitalInvestment < 40000) {
            return 532.40;
          } else if (capitalInvestment >= 40000 && capitalInvestment < 50000) {
            return 798.60;
          } else if (capitalInvestment >= 50000 && capitalInvestment < 75000) {
            return 1197.90;
          } else if (capitalInvestment >= 75000 && capitalInvestment < 100000) {
            return 1597.20;
          } else if (capitalInvestment >= 100000 && capitalInvestment < 150000) {
            return 2262.70;
          } else if (capitalInvestment >= 150000 && capitalInvestment < 200000) {
            return 2928.20;
          } else if (capitalInvestment >= 200000 && capitalInvestment < 300000) {
            return 3993.00;
          } else if (capitalInvestment >= 300000 && capitalInvestment < 500000) {
            return 5324.00;
          } else if (capitalInvestment >= 500000 && capitalInvestment < 750000) {
            return 7986.00;
          } else if (capitalInvestment >= 750000 && capitalInvestment < 1000000) {
            return 10648.00;
          } else if (capitalInvestment >= 1000000 && capitalInvestment < 2000000) {
            return 12100.00;
          } else if (capitalInvestment >= 2000000) {
            return capitalInvestment * 0.00605; // 60.5% of 1%
          }
        }
        return 0; // Default to no tax for other classifications or unmatched conditions
      }
    },
    {//Wholesaler Essential
      category: 'WHE',
      check: (businessNature) => businessNature.startsWith('WHE'),
      taxCalculation: (capitalInvestment, classification) => {
        if (classification === 'NewBusiness') {
          // Tax for new businesses
          const tax = Math.max(220, capitalInvestment * 0.0005); // 1/20th of 1% of capital investment
          return tax;
            }
        if (classification === 'RenewBusiness') {
          if (capitalInvestment < 1000) {
            return 10.89;
          } else if (capitalInvestment >= 1000 && capitalInvestment < 2000) {
            return 19.97;
          } else if (capitalInvestment >= 2000 && capitalInvestment < 3000) {
            return 30.25;
          } else if (capitalInvestment >= 3000 && capitalInvestment < 4000) {
            return 43.56;
          } else if (capitalInvestment >= 4000 && capitalInvestment < 5000) {
            return 60.50;
          } else if (capitalInvestment >= 5000 && capitalInvestment < 6000) {
            return 73.21;
          } else if (capitalInvestment >= 6000 && capitalInvestment < 7000) {
            return 86.52;
          } else if (capitalInvestment >= 7000 && capitalInvestment < 8000) {
            return 99.83;
          } else if (capitalInvestment >= 8000 && capitalInvestment < 10000) {
            return 113.10;
          } else if (capitalInvestment >= 10000 && capitalInvestment < 15000) {
            return 133.10;
          } else if (capitalInvestment >= 15000 && capitalInvestment < 20000) {
            return 166.38;
          } else if (capitalInvestment >= 20000 && capitalInvestment < 30000) {
            return 199.65;
          } else if (capitalInvestment >= 30000 && capitalInvestment < 40000) {
            return 266.20;
          } else if (capitalInvestment >= 40000 && capitalInvestment < 50000) {
            return 399.30;
          } else if (capitalInvestment >= 50000 && capitalInvestment < 75000) {
            return 598.95;
          } else if (capitalInvestment >= 75000 && capitalInvestment < 100000) {
            return 798.60;
          } else if (capitalInvestment >= 100000 && capitalInvestment < 150000) {
            return 1131.35;
          } else if (capitalInvestment >= 150000 && capitalInvestment < 200000) {
            return 1464.10;
          } else if (capitalInvestment >= 200000 && capitalInvestment < 300000) {
            return 1996.50;
          } else if (capitalInvestment >= 300000 && capitalInvestment < 500000) {
            return 2662.00;
          } else if (capitalInvestment >= 500000 && capitalInvestment < 750000) {
            return 3993.00;
          } else if (capitalInvestment >= 750000 && capitalInvestment < 1000000) {
            return 5324.00;
          } else if (capitalInvestment >= 1000000 && capitalInvestment < 2000000) {
            return 6050.00;
          } else if (capitalInvestment >= 2000000) {
            return capitalInvestment * 0.003025; // 30.25% of 1%
          }
        }
        return 0; // Default to no tax for other classifications or unmatched conditions
      }
    },
    {//Cockpit Operator
      category: 'OPRC',
      check: (businessNature) => businessNature.startsWith('OPRC'),
      taxCalculation: (classification) => {
        if (classification === 'NewBusiness') {
          // Tax for new businesses
          const tax = Math.max(220, capitalInvestment * 0.0005); // 1/20th of 1% of capital investment
          return tax;
            }
        // Automatically return tax for OPRC
        if (classification === 'RenewBusiness') {
          return 9317;
        }
        return 0; // Default to no tax for other classifications or unmatched conditions
      }
    },
    {//Operator - Cockpit - Promoter - Ordinary Operator
      category: 'OPRCPO',
      check: (businessNature) => businessNature.startsWith('OPRCPO'),
      taxCalculation: (classification) => {
        if (classification === 'NewBusiness') {
          // Tax for new businesses
          const tax = Math.max(220, capitalInvestment * 0.0005); // 1/20th of 1% of capital investment
          return tax;
            }
        // Automatically return tax for OPRCPO
        if (classification === 'RenewBusiness') {
          return 12.10;
        }
        return 0; // Default to no tax for other classifications or unmatched conditions
      }
    },
    {//Operator - Cockpit - Promoter - Pintakasi / Concierto
          category: 'OPRCP',
          check: (businessNature) => businessNature.startsWith('OPRCPO'),
          taxCalculation: (classification) => {
            if (classification === 'NewBusiness') {
              // Tax for new businesses
              const tax = Math.max(220, capitalInvestment * 0.0005); // 1/20th of 1% of capital investment
              return tax;
                }
            // Automatically return tax for OPRCPO
            if (classification === 'RenewBusiness') {
              return 18.15;
            }
            return 0; // Default to no tax for other classifications or unmatched conditions
          }
    },
    {//Operator - Subdivision
      category: 'ORPS',
      check: (businessNature) => businessNature.startsWith('ORPS'),
      taxCalculation: (capitalInvestment, classification) => {
        if (classification === 'NewBusiness') {
          // Tax for new businesses
          const tax = Math.max(220, capitalInvestment * 0.0005); // 1/20th of 1% of capital investment
          return tax;
            }
        if (classification === 'RenewBusiness') {
          if (capitalInvestment < 50000) {
            return 302.50;
          } else if (capitalInvestment >= 50000 && capitalInvestment < 100000) {
            return 605.00;
          } else if (capitalInvestment >= 100000 && capitalInvestment < 250000) {
            return 847.00;
          } else if (capitalInvestment >= 250000 && capitalInvestment < 500000) {
            return 1089.00;
          } else if (capitalInvestment >= 500000 && capitalInvestment < 1000000) {
            return 1452.00;
          } else if (capitalInvestment >= 1000000) {
            // For every 100,000 in excess of 1,000,000, add 145.20
            let excessAmount = capitalInvestment - 1000000;
            let additionalTax = Math.floor(excessAmount / 100000) * 145.20;
            return 1452.00 + additionalTax;
          }
        }
        return 0; // Default to no tax for other classifications or unmatched conditions
      }
    },
    {//Operator - Theaters
      category: 'OPRT',
      check: (businessNature) => businessNature.startsWith('OPRT'),
      taxCalculation: (capitalInvestment, classification) => {
        if (classification === 'NewBusiness') {
          // Tax for new businesses
          const tax = Math.max(220, capitalInvestment * 0.0005); // 1/20th of 1% of capital investment
          return tax;
            }
        if (classification === 'RenewBusiness') {
          if (capitalInvestment < 5000) {
            return 60.50;
          } else if (capitalInvestment >= 5000 && capitalInvestment < 10000) {
            return 90.75;
          } else if (capitalInvestment >= 10000 && capitalInvestment < 15000) {
            return 121.00;
          } else if (capitalInvestment >= 15000 && capitalInvestment < 20000) {
            return 181.50;
          } else if (capitalInvestment >= 20000 && capitalInvestment < 30000) {
            return 242.00;
          } else if (capitalInvestment >= 30000 && capitalInvestment < 40000) {
            return 326.70;
          } else if (capitalInvestment >= 40000 && capitalInvestment < 50000) {
            return 423.50;
          } else if (capitalInvestment >= 50000 && capitalInvestment < 75000) {
            return 484.00;
          } else if (capitalInvestment >= 75000 && capitalInvestment < 100000) {
            return 605.00;
          } else if (capitalInvestment >= 100000 && capitalInvestment < 150000) {
            return 968.00;
          } else if (capitalInvestment >= 150000 && capitalInvestment < 200000) {
            return 1089.00;
          } else if (capitalInvestment >= 200000 && capitalInvestment < 250000) {
            return 1210.00;
          } else if (capitalInvestment >= 250000 && capitalInvestment < 300000) {
            return 2783.00;
          } else if (capitalInvestment >= 300000 && capitalInvestment < 400000) {
            return 3025.00;
          } else if (capitalInvestment >= 400000 && capitalInvestment < 500000) {
            return 3630.00;
          } else if (capitalInvestment >= 500000) {
            // 60.50% of 1% for capital investments greater than or equal to 500,000
            return 0.605 * 0.01 * capitalInvestment;
          }
        }
        return 0; // Default to no tax for other classifications or unmatched conditions
      }
    },
    {//Operator Restaurant
      category: 'OPRR',
      check: (businessNature) => businessNature.startsWith('OPRR'),
      taxCalculation: (capitalInvestment, classification) => {
        if (classification === 'NewBusiness') {
          // Tax for new businesses
          const tax = Math.max(220, capitalInvestment * 0.0005); // 1/20th of 1% of capital investment
          return tax;
            }
        if (classification === 'RenewBusiness') {
          if (capitalInvestment < 2000) {
            return 60.50;
          } else if (capitalInvestment >= 2000 && capitalInvestment < 3000) {
            return 84.70;
          } else if (capitalInvestment >= 3000 && capitalInvestment < 4000) {
            return 108.90;
          } else if (capitalInvestment >= 4000 && capitalInvestment < 5000) {
            return 121.00;
          } else if (capitalInvestment >= 5000 && capitalInvestment < 6000) {
            return 133.10;
          } else if (capitalInvestment >= 6000 && capitalInvestment < 7000) {
            return 157.30;
          } else if (capitalInvestment >= 7000 && capitalInvestment < 8000) {
            return 181.50;
          } else if (capitalInvestment >= 8000 && capitalInvestment < 9000) {
            return 211.75;
          } else if (capitalInvestment >= 9000 && capitalInvestment < 10000) {
            return 242.00;
          } else if (capitalInvestment >= 10000 && capitalInvestment < 11000) {
            return 272.25;
          } else if (capitalInvestment >= 11000 && capitalInvestment < 12000) {
            return 302.50;
          } else if (capitalInvestment >= 12000 && capitalInvestment < 13000) {
            return 332.75;
          } else if (capitalInvestment >= 13000 && capitalInvestment < 14000) {
            return 363.00;
          } else if (capitalInvestment >= 14000 && capitalInvestment < 15000) {
            return 393.25;
          } else if (capitalInvestment >= 15000 && capitalInvestment < 17000) {
            return 423.50;
          } else if (capitalInvestment >= 17000 && capitalInvestment < 19000) {
            return 447.70;
          } else if (capitalInvestment >= 19000 && capitalInvestment < 21000) {
            return 459.80;
          } else if (capitalInvestment >= 21000 && capitalInvestment < 23000) {
            return 484.00;
          } else if (capitalInvestment >= 23000 && capitalInvestment < 25000) {
            return 514.25;
          } else if (capitalInvestment >= 25000 && capitalInvestment < 27000) {
            return 544.50;
          } else if (capitalInvestment >= 27000 && capitalInvestment < 29000) {
            return 574.75;
          } else if (capitalInvestment >= 29000 && capitalInvestment < 31000) {
            return 592.90;
          } else if (capitalInvestment >= 31000 && capitalInvestment < 33000) {
            return 635.25;
          } else if (capitalInvestment >= 33000 && capitalInvestment < 35000) {
            return 665.50;
          } else if (capitalInvestment >= 35000 && capitalInvestment < 40000) {
            return 786.50;
          } else if (capitalInvestment >= 40000 && capitalInvestment < 50000) {
            return 907.50;
          } else if (capitalInvestment >= 50000 && capitalInvestment < 60000) {
            return 1028.50;
          } else if (capitalInvestment >= 60000 && capitalInvestment < 80000) {
            return 1119.25;
          } else if (capitalInvestment >= 80000 && capitalInvestment < 100000) {
            return 1210.00;
          } else if (capitalInvestment >= 100000) {
            // 60.50% of 1% for capital investments greater than or equal to 100,000
            return 0.605 * 0.01 * capitalInvestment;
          }
        }
        return 0; // Default to no tax for other classifications or unmatched conditions
      }
    },
    {//Privately Owned Market
      category: 'OPRM',
      check: (businessNature) => businessNature.startsWith('OPRM'),
      taxCalculation: (capitalInvestment, classification) => {
        if (classification === 'NewBusiness') {
          if (capitalInvestment <= 1000000) {
            return 0.605 * 0.01 * capitalInvestment; // 60.50% of 1% for capital investment of 1,000,000 or less
          } else if (capitalInvestment > 1000000) {
            return 0.583 * 0.01 * capitalInvestment; // 58.30% of 1% for capital investment greater than 1,000,000
          }
        }
        return 0; // Default to no tax for other classifications or unmatched conditions
      }
    },
    {//Private Cemeteries
      category: 'OPRPC',
      check: (businessNature) => businessNature.startsWith('OPRPC'),
      taxCalculation: (capitalInvestment, classification) => {
        if (classification === 'NewBusiness') {
          // Tax for new businesses
          const tax = Math.max(220, capitalInvestment * 0.0005); // 1/20th of 1% of capital investment
          return tax;
            }
        if (classification === 'RenewBusiness') {
          if (capitalInvestment < 5000) {
            return 60.50;
          } else if (capitalInvestment >= 5000 && capitalInvestment < 10000) {
            return 90.75;
          } else if (capitalInvestment >= 10000 && capitalInvestment < 20000) {
            return 272.25;
          } else if (capitalInvestment >= 20000 && capitalInvestment < 30000) {
            return 393.25;
          } else if (capitalInvestment >= 30000 && capitalInvestment < 40000) {
            return 514.25;
          } else if (capitalInvestment >= 40000 && capitalInvestment < 50000) {
            return 635.25;
          } else if (capitalInvestment >= 50000) {
            // For every 5,000 in excess of 50,000, PhP 60.50 is added
            const excessAmount = capitalInvestment - 50000;
            const excessTax = Math.floor(excessAmount / 5000) * 60.50;
            return 635.25 + excessTax;
          }
        }
        return 0; // Default to no tax for other classifications or unmatched conditions
      }
    }
  ];
  

  for (const condition of conditions) {
    if (condition.check(businessNature)) {
      return condition.taxCalculation(capitalInvestment, classification);
    }
  }

  console.warn(`No matching condition found for BusinessNature: ${businessNature}, Classification: ${classification}`);
  return null; // Default case if no conditions match
};


router.post('/updatebusinessnature/:id', async (req, res) => {
  const { id } = req.params;
  const { businesses, deletedIds, businessesupdates } = req.body;

  try {
    const permit = await BusinessPermit.findById(id);
console
    if (!permit) {
      return res.status(404).json({ message: 'Business permit not found' });
    }

    // Remove deleted businesses
    permit.businesses = permit.businesses.filter(
      (business) => !deletedIds.includes(business._id.toString())
    );

    // add new ones
    businesses.forEach((business) => {
      const index = permit.businesses.findIndex(
        (b) => b._id.toString() === business._id
      );
            // Add new business and compute tax
            const tax = computeTax(business.businessNature, business.capitalInvestment, permit.classification);
            business.tax = tax;
        // Add new business
        permit.businesses.push(business);
    });

       // Update existing businesses
       businessesupdates.forEach((business) => {
        const index = permit.businesses.findIndex(
          (b) => b._id.toString() === business._id
        );
        if (index !== -1) {
                // Add new business and compute tax
      const tax = computeTax(business.businessNature, business.capitalInvestment, permit.classification);
      business.tax = tax;
          // Update existing business
          permit.businesses[index] = business;
        } 
      });

          // Calculate the total capital investment and total tax
    const totalCapitalInvestment = permit.businesses.reduce(
      (total, business) => total + (business.capitalInvestment || 0),
      0
    );

    const totalTax = permit.businesses.reduce(
      (total, business) => total + (business.tax || 0),
      0
    );
    permit.totalgrosssales = totalCapitalInvestment;
    permit.totaltax = totalTax;

    await permit.save();

    res.status(200).json({ message: 'Businesses updated successfully', data: permit });
  } catch (error) {
    console.error('Database update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/updatebusinessnature/:id', async (req, res) => {
  const { id } = req.params;
  const { businesses, deletedIds, businessesupdates } = req.body;

  try {
    const permit = await BusinessPermit.findById(id);
console
    if (!permit) {
      return res.status(404).json({ message: 'Business permit not found' });
    }

    // Remove deleted businesses
    permit.businesses = permit.businesses.filter(
      (business) => !deletedIds.includes(business._id.toString())
    );

    // add new ones
    businesses.forEach((business) => {
      const index = permit.businesses.findIndex(
        (b) => b._id.toString() === business._id
      );
            // Add new business and compute tax
            const tax = computeTax(business.businessNature, business.capitalInvestment, permit.classification);
            business.tax = tax;
        // Add new business
        permit.businesses.push(business);
    });

       // Update existing businesses
       businessesupdates.forEach((business) => {
        const index = permit.businesses.findIndex(
          (b) => b._id.toString() === business._id
        );
        if (index !== -1) {
                // Add new business and compute tax
      const tax = computeTax(business.businessNature, business.capitalInvestment, permit.classification);
      business.tax = tax;
          // Update existing business
          permit.businesses[index] = business;
        } 
      });

          // Calculate the total capital investment and total tax
    const totalCapitalInvestment = permit.businesses.reduce(
      (total, business) => total + (business.capitalInvestment || 0),
      0
    );

    const totalTax = permit.businesses.reduce(
      (total, business) => total + (business.tax || 0),
      0
    );
    permit.totalgrosssales = totalCapitalInvestment;
    permit.totaltax = totalTax;

    await permit.save();

    res.status(200).json({ message: 'Businesses updated successfully', data: permit });
  } catch (error) {
    console.error('Database update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/SavingAssessment/:id', async (req, res) => {
  const { id } = req.params;
  const updatedStatement = req.body; // The `updatedData` object sent from the frontend

  try {
    // Extract the token from the request cookies
    const token = req.cookies.authToken;
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Decode the token to get the user ID
    const decoded = jwt.verify(token, JWT_SECRET); // Assuming JWT_SECRET is in your environment variables
    const user = await User.findById(decoded.userId);
    const BusinessPermitContent = await BusinessPermit.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const statementofaccountfile = await generateStatementofAccount(updatedStatement, BusinessPermitContent);
    const updatedPermit = await BusinessPermit.findByIdAndUpdate(
      id,
      {
        $set: {
          // Compute the total amount to pay
          'amountToPay': updatedStatement.paymentmethodtotal,
          'totaltax': updatedStatement.total,
          'transaction': `${updatedStatement.paymentmethod} Payment`,
          'business.paymentmethod': updatedStatement.paymentmethod,
          'businesspermitstatus': 'Assessed',
          'statementofaccount.permitassessed': decoded.userId, // Update permitassessed with the userId
          'statementofaccount.dateassessed': updatedStatement.dateassessed,
          'statementofaccount.mayorspermit': updatedStatement.mayorspermit,
          'statementofaccount.sanitary': updatedStatement.sanitary,
          'statementofaccount.health': updatedStatement.health,
          'statementofaccount.businessplate': updatedStatement.businessplate,
          'statementofaccount.zoningclearance': updatedStatement.zoningclearance,
          'statementofaccount.annualInspection': updatedStatement.annualInspection,
          'statementofaccount.environmental': updatedStatement.environmental,
          'statementofaccount.miscfee': updatedStatement.miscfee,
          'statementofaccount.liquortobaco': updatedStatement.liquortobaco,
          'statementofaccount.liquorplate': updatedStatement.liquorplate,
          'statementofaccount.statementofaccountfile': statementofaccountfile
        }
      },
      { new: true } // Return the updated document
    );
    
    if (!updatedPermit) {
      return res.status(404).json({ message: 'BusinessPermit not found' });
    }

    res.status(200).json({ message: 'Update successful', updatedPermit });
  } catch (error) {
    console.error('Error updating statement of account:', error);
    res.status(500).json({ message: 'Update failed', error });
  }
});

router.get('/getAssessedPerson/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Find the BusinessPermit by ID and populate the permitassessed field with user details (firstName, lastName)
    const permit = await BusinessPermit.findById(id)
      .populate('statementofaccount.permitassessed', 'firstName lastName'); // Populate firstName, lastName of the user

    if (!permit) {
      return res.status(404).json({
        firstName: 'none',
        lastName: 'none'
      });
    }

    // Check if permitassessed exists and is populated
    const permitAssessed = permit.statementofaccount?.permitassessed;

    if (!permitAssessed) {
      return res.status(200).json({
        firstName: 'none',
        lastName: 'none'
      });
    }

    // Access the user details from permitassessed
    const firstName = permitAssessed.firstName;
    const lastName = permitAssessed.lastName;

    // Return the firstName and lastName as 'none' if missing
    res.status(200).json({
      firstName,
      lastName
    });

  } catch (error) {
    console.error('Error fetching permit:', error);
    res.status(500).json({
      firstName: 'none',
      lastName: 'none'
    });
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

// For the Dashboard
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

  router.post('/updateworkpermitpayments/:id', receipt.fields([
    { name: 'document1', maxCount: 1 },
  ]), async (req, res) => {
    const token = req.cookies.authToken; // Extract token from the cookie
   // console.log('Received token:', token);
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const permitId = req.params.id;
    const files = req.files;
    console.log(req.files)


    try {
      const decoded = jwt.verify(token, JWT_SECRET); // Decode the JWT to get the userId
      console.log('Decoded token:', decoded);
      const workpermitFileName = await generateWorkPermitPDF(permitId);
      

      const updatedPermit = await WorkPermit.findByIdAndUpdate(
        permitId,
        { $set: {
          
          workpermitstatus: "Released",
          transaction: "Complete",
          permitFile: workpermitFileName,
          permitDateIssued: new Date().toISOString(),
          permitExpiryDate: new Date(Date.now() + 31536000000).toISOString(),
          expiryDate: new Date(Date.now() + 31536000000).toISOString(),
  
  
          receipt: {
          receiptDate: new Date().toISOString(),
          amountPaid: 200,
          receiptFile: files.document1 ? files.document1[0].filename : null,
        }
      }
      }
      );
  
      if (!updatedPermit) {
        return res.status(404).json({ message: 'Work permit not found' });
      }
  
  // Send a single response
  res.status(200).json({
    message: "Updated Payment",
    updatedPermit,
  });
    } catch (error) {
      console.error('Error saving application:', error.message); // Log the error message
      res.status(500).json({ message: 'Error submitting application', error: error.message });
    }
  });

  // Endpoint to mark a business permit as expired
  router.put('/expirebusinesspermit/:id', async (req, res) => {
    try {
      const { id } = req.params;
  
      // Find the business permit to be updated
      const permit = await BusinessPermit.findById(id);
  
      if (!permit) {
        return res.status(404).json({ message: 'Business permit not found' });
      }
  
      // Update the businesses array: transfer capitalInvestment to lastYearGross and set businessType to 'Renew'
      const updatedBusinesses = permit.businesses.map((business) => {
        if (business.capitalInvestment) {
          business.lastYearGross = business.capitalInvestment; // Move value
          business.capitalInvestment = null; // Clear capitalInvestment
        }
        business.businessType = 'Renew'; // Update the businessType to 'Renew' for all businesses
        return business;
      });
  
      // Update the permit's businesses array
      permit.businesses = updatedBusinesses;
  
      // Update the permit status to 'Expired'
      permit.businesspermitstatus = 'Expired';
  
      // Save the updated permit
      const updatedPermit = await permit.save();
  
      res.status(200).json({
        message: 'Business permit updated successfully',
        updatedPermit,
      });
    } catch (error) {
      console.error('Error updating business permit:', error);
      res.status(500).json({ message: 'Error updating business permit' });
    }
  });
  

  router.put('/retirebusinesspermits/:id', async (req, res) => {
    const { id } = req.params;
    const { classification, businessstatus, forretirement } = req.body;
  
    try {
      // Find and update the business permit
      const updatedPermit = await BusinessPermit.findByIdAndUpdate(
        id,
        {
          classification,
          businessstatus,
          forretirement,
        },
        { new: true } // Return the updated document
      );
  
      if (!updatedPermit) {
        return res.status(404).json({ message: 'Business Permit not found' });
      }
  
      res.status(200).json({ message: 'Business Permit updated successfully', updatedPermit });
    } catch (error) {
      console.error('Error updating business permit:', error);
      res.status(500).json({ message: 'Failed to update business permit' });
    }
  });
  
  


  module.exports = router;