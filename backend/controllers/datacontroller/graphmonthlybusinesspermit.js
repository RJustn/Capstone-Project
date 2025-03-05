const { BusinessPermit } = require('../../index/models');

const graphmonthlybusinesspermit = async (req, res) => {
  try {
    const data = await BusinessPermit.aggregate([
      {
        $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          approved: { $sum: { $cond: [{ $eq: ["$businesspermitstatus", "Approved"] }, 1, 0] } },
          waitingForPayment: { $sum: { $cond: [{ $eq: ["$businesspermitstatus", "Waiting for Payment"] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ["$businesspermitstatus", "Rejected"] }, 1, 0] } }
        }
      },
      {
        $project: {
          month: "$_id.month",
          year: "$_id.year",
          approved: 1,	
          waitingForPayment: 1,
          rejected: 1,
          _id: 0
        }
      },
      { $sort: { year: 1, month: 1 } }
    ]);

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching monthly business permit status data:', error);
    res.status(500).json({ error: 'Server error, please try again later.' });
  }
};

module.exports = { graphmonthlybusinesspermit };