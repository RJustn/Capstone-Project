const { WorkPermit, BusinessPermit } = require('../../index/models');


// Endpoint for fetching the count of new working permits 
const newWorkingpermits = async (req, res) => {
  try {
    const monthlyData = await WorkPermit.aggregate([
      {
        $match: { classification: 'New' }
      },
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
    console.error('Error fetching monthly new working permits:', error);
    res.status(500).json({ message: 'Error fetching monthly new working permits' });
  }
};

const renewalWorkingpermits = async (req, res) => {
  try {
    const monthlyData = await WorkPermit.aggregate([
      {
        $match: { classification: 'Renew' }
      },
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
    console.error('Error fetching monthly renewal working permits:', error);
    res.status(500).json({ message: 'Error fetching monthly renewal working permits' });
  }
};

const newBusinesspermits = async (req, res) => {
  try {
    const monthlyData = await BusinessPermit.aggregate([
      {
        $match: { classification: 'NewBusiness' }
      },
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
    console.error('Error fetching monthly new business permits:', error);
    res.status(500).json({ message: 'Error fetching monthly new business permits' });
  }
};

const renewalBusinesspermits = async (req, res) => {
  try {
    const monthlyData = await BusinessPermit.aggregate([
      {
        $match: { classification: 'RenewBusiness' } // Ensure this matches the correct classification
      },
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
    console.error('Error fetching monthly renewal business permits:', error);
    res.status(500).json({ message: 'Error fetching monthly renewal business permits' });
  }
};
  
  
// Endpoint for fetching the count of working permits
const workingpermitsChart = async (req, res) => {
  try {
    const monthlyData = await WorkPermit.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $arrayElemAt: [["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], "$_id.month"] },
              " ",
              { $toString: "$_id.year" },
            ],
          },
          count: 1,
        },
      },
    ]);

    res.json(monthlyData);
  } catch (error) {
    console.error('Error fetching working permit data:', error);
    res.status(500).json({ message: 'Error fetching working permit data' });
  }
};

// Endpoint for fetching the count of business permits
const businesspermitsChart = async (req, res) => {
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
    console.error('Error fetching business permit data:', error);
    res.status(500).json({ message: 'Error fetching business permit data' });
  }
};
  
  // For the Dashboard
   const workpermitdatastats = async (req, res) => {
    try {
      const totalPermitApplications = await WorkPermit.countDocuments();
      const totalRenewalApplications = await WorkPermit.countDocuments({ classification: 'Renew' });
      const totalCollections = await WorkPermit.aggregate([
        { $group: { _id: null, total: { $sum: "$amountToPay" } } }
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
  };
  
  // Endpoint to fetch dashboard data
     const dashboardData = async (req, res) => {
    try {
      const totalWorkPermitApplications = await WorkPermit.countDocuments();
      const totalWorkRenewalApplications = await WorkPermit.countDocuments({ classification: 'Renew' });
      const totalWorkCollections = await WorkPermit.aggregate([
        { $match: { workpermitstatus: "Released" } },
        { $group: { _id: null, total: { $round: [{ $sum: { $ifNull: [{ $toDouble: "$amountToPay" }, 0] } }, 2] } } }
      ]);
      const totalWorkReleased = await WorkPermit.countDocuments({ workpermitstatus: 'Released' });
  
      const totalBusinessPermitApplications = await BusinessPermit.countDocuments();
      const totalBusinessRenewalApplications = await BusinessPermit.countDocuments({ classification: 'RenewBusiness' });
      const totalBusinessCollections = await BusinessPermit.aggregate([
        { $match: { businesspermitstatus: "Released" } },
        { $group: { _id: null, total: { $round: [{ $sum: { $ifNull: [{ $toDouble: "$amountToPay" }, 0] } }, 2] } } }
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
  };
  
  // Endpoint to fetch permit applications by category
     const permitApplicationsByCategory = async (req, res) => {
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
  };


const businesspermitmonthlyappication =  async (req, res) => {
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
  };


  

  module.exports = {newWorkingpermits, renewalWorkingpermits, newBusinesspermits, renewalBusinesspermits, workingpermitsChart, businesspermitsChart, workpermitdatastats, dashboardData, permitApplicationsByCategory, businesspermitmonthlyappication}
