const express = require('express');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const cron = require('node-cron');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const { User, WorkPermit,BusinessPermit} = require('./Modals')


router.use(express.json());


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
  
  
  router.get('/chart/working-permits', async (req, res) => {
    try {
      const workingPermits = await WorkPermit.countDocuments();
      res.json({ label: 'Working Permit', count: workingPermits });
    } catch (error) {
      console.error('Error fetching working permit data:', error);
      res.status(500).json({ message: 'Error fetching working permit data' });
    }
  });
  
  // Endpoint for fetching the count of business permits
  router.get('/chart/business-permits', async (req, res) => {
    try {
      const businessPermits = await BusinessPermit.countDocuments();
      res.json({ label: 'Business Permit', count: businessPermits });
    } catch (error) {
      console.error('Error fetching business permit data:', error);
      res.status(500).json({ message: 'Error fetching business permit data' });
    }
  });

  module.exports = router;