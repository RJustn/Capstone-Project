const { WorkPermit } = require('../../index/models'); 

const getWorkPermitStatus = async (req, res) => {
    try {
        const workPermitStatusCounts = await WorkPermit.aggregate([
            { 
                $group: { 
                    _id: "$workpermitstatus", 
                    count: { $sum: 1 },
                    lastEdited: { $max: "$lastEdited" }
                } 
            },
            { 
                $project: { 
                    workpermitstatus: "$_id", 
                    count: 1, 
                    lastEdited: 1, 
                    _id: 0 
                } 
            },
        ]);
        res.status(200).json(workPermitStatusCounts);
    } catch (error) {
        console.error('Error fetching work permit status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {getWorkPermitStatus};
