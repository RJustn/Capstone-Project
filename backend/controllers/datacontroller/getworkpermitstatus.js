const { WorkPermit } = require('../../index/models'); 

const getWorkPermitStatus = async (req, res) => {
    try {
        const workPermitStatusCounts = await WorkPermit.aggregate([
            {
                $group: {
                    _id: '$workpermitstatus', // Group by workpermitstatus
                    count: { $sum: 1 } // Count the number of occurrences
                }
            }
        ]);
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching work permit status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {getWorkPermitStatus};
