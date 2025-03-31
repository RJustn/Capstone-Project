const { BusinessPermit } = require('../../index/models'); // Corrected model import path

const getBusinessPermitStatus = async (req, res) => {
    try {
        const data = await BusinessPermit.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
            { $project: { status: "$_id", count: 1, _id: 0 } }
        ]);
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching business permit status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {getBusinessPermitStatus};
