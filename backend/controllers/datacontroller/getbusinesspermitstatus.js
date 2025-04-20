const { BusinessPermit } = require('../../index/models'); // Corrected model import path

const getBusinessPermitStatus = async (req, res) => {
    try {
        const businessPermitStatusCounts = await BusinessPermit.aggregate([
            { 
                $group: { 
                    _id: "$businesspermitstatus", 
                    count: { $sum: 1 },
                    lastEdited: { $max: "$lastEdited" } // Get the most recent lastEdited timestamp
                } 
            },
            { 
                $project: { 
                    businesspermitstatus: "$_id", 
                    count: 1, 
                    lastEdited: 1, 
                    _id: 0 
                } 
            },
        ]);
        res.status(200).json(businessPermitStatusCounts);
    } catch (error) {
        console.error('Error fetching business permit status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { getBusinessPermitStatus };