const { BusinessPermit } = require('../../index/models');

const getbusinesspermitforpayment = async (req, res) => {
    try {
     
      const { type } = req.params;  // Extract the work permit ID from the route parameters
  console.log(type);
      // Define filters for "Pending" or "Assessed" status
      let filters = { businesspermitstatus: { $in: ['Waiting for Payment', 'Processing Payment'] } };
  
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
  };

  module.exports = {getbusinesspermitforpayment};