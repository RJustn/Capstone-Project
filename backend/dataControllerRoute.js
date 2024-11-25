const express = require('express');
const { User ,WorkPermit } = require('./Modals'); //add buisness permit connection here

const router = express.Router();

// Get work permits for assessment
router.get('/getworkpermitsforassessment', async (req, res) => {
  try {
    const pendingWorkPermits = await WorkPermit.find({ workpermitstatus: 'Pending' });
    res.json(pendingWorkPermits);
  } catch (error) {
    console.error('Error fetching work permits:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get work permits for payments
router.get('/getworkpermitsforpayments', async (req, res) => {
  try {
    const pendingWorkPermits = await WorkPermit.find({ workpermitstatus: 'Waiting for Payment' });
    res.json(pendingWorkPermits);
  } catch (error) {
    console.error('Error fetching work permits:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get work permits for release
router.get('/getworkpermitsforrelease', async (req, res) => {
  try {
    const pendingWorkPermits = await WorkPermit.find({ workpermitstatus: { $in: ['Released', 'Expired'] } });
    res.json(pendingWorkPermits);
  } catch (error) {
    console.error('Error fetching work permits:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get work permit details by ID
router.get('/DCworkpermitdetails/:id', async (req, res) => {
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

// Update work permit status
router.put('/work-permits/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const ContentData = { id };

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

    const updatedPermit = await WorkPermit.findByIdAndUpdate(id, { $set: updateFields }, { new: true });

    if (!updatedPermit) {
      return res.status(404).json({ message: 'Work permit not found' });
    }

    res.json(updatedPermit);
  } catch (error) {
    console.error('Error updating work permit:', error);
    res.status(500).json({ error: 'Error updating work permit' });
  }
});

// Reject work permit
router.put('/work-permitsreject/:id', async (req, res) => {
  const { id } = req.params;
  const { status, comments } = req.body;

  try {
    const updatedPermit = await WorkPermit.findByIdAndUpdate(
      id,
      { $set: { workpermitstatus: status, applicationComments: comments } },
      { new: true }
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

// Handle payments
router.put('/handlepayments/:id', async (req, res) => {
  const { id } = req.params;
  const receiptID = uuidv4();
  const { accountNumber, amount, paymentName, paymentMethod, paymentType } = req.body;
  const ContentData = {
    accountNumber,
    amount,
    paymentName,
    paymentMethod,
    paymentType,
    receiptID,
    id,
  };

  try {
    const receiptFileName = generateReceiptPDF(ContentData);
    const workpermitFileName = await generateWorkPermitPDF(ContentData);

    const updatedPermit = await WorkPermit.findByIdAndUpdate(
      id,
      {
        $set: {
          workpermitstatus: "Released",
          transaction: paymentMethod,
          permitFile: workpermitFileName,
          permitDateIssued: new Date().toISOString(),
          permitExpiryDate: new Date(Date.now() + 31536000000).toISOString(),
          expiryDate: new Date(Date.now() + 31536000000).toISOString(),
          receipt: {
            receiptID,
            modeOfPayment: paymentMethod,
            paymentType,
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

module.exports = router;