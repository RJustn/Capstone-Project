const { BusinessPermit } = require('../../index/models'); // Corrected model import path

const getBusinessPermitStatus = async (req, res) => {
    try {
        const data = await BusinessPermit.aggregate([
            {
                $group: {
                    _id: '$businesspermitstatus', // Group by businesspermitstatus
                    count: { $sum: 1 } // Count the number of occurrences
                }
            }
        ]);
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching business permit status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { getBusinessPermitStatus };