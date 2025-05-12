const jwt = require('jsonwebtoken');
const { WorkPermit } = require('../../index/models');
const { generateWorkPermitPDF } = require('../../index/utils')
const JWT_SECRET = 'your_jwt_secret'; 

const releaseworkpermitrenewal = async (req, res) => {
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
      console.log("Generating Work Permit PDF for ID:", permitId);
const workpermitFileName = await generateWorkPermitPDF(permitId);
console.log("Generated PDF File:", workpermitFileName);
      
const existingPermit = await WorkPermit.findById(permitId);
if (!existingPermit) {
  return res.status(404).json({ message: 'Work permit not found' });
}

      const updatedPermit = await WorkPermit.findByIdAndUpdate(
  permitId,
  {
    $set: {
      workpermitstatus: "Released",
      transaction: "Complete",
      permitFile: workpermitFileName,
      permitDateIssued: new Date().toISOString(),
      permitExpiryDate: new Date(Date.now() + 31536000000).toISOString(),
      expiryDate: new Date(Date.now() + 31536000000).toISOString(),
    },
  },
  { new: true }
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
  };

  module.exports = { releaseworkpermitrenewal };