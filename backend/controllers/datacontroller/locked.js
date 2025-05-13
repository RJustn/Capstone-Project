const { WorkPermit, BusinessPermit } = require('../../index/models');

const lockBusinessPermit = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    // Validate `userId`
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    // Validate `id` format
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid permit ID' });
    }

    try {
        const permit = await BusinessPermit.findById(id);
        if (!permit) {
            return res.status(404).json({ message: 'Permit not found' });
        }

        if (permit.lockedBy && permit.lockedBy !== userId) {
            return res.status(403).json({ message: 'Permit is already being assessed by another user' });
        }

        permit.lockedBy = userId;
        permit.lockTimestamp = new Date();
        await permit.save();

        res.status(200).json({ message: 'Permit locked successfully' });
    } catch (error) {
        console.error('Error locking permit:', error);
        res.status(500).json({ message: 'Error locking permit', error });
    }
};

const unlockBusinessPermit = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;
    try {
        const permit = await BusinessPermit.findById(id);
        if (!permit) {
            return res.status(404).json({ message: 'Permit not found'});
        }
        if (permit.lockedBy !== userId) {
            return res.status(403).json({ message: 'You do not have permission to unlock this permit' });
        }
        permit.lockedBy = null;
        permit.lockTimestamp = null;
        await permit.save();

        res.status(200).json({ message: 'Permit unlocked successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error unlocking permit', error });
    }
}

const lockWorkPermit = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;
    try {
        const permit = await WorkPermit.findById(id);
        if (!permit) {
            return res.status(404).json({ message: 'Permit not found'});
        }
        if (permit.lockedBy && permit.lockedBy !== userId) {
            return res.status(403).json({ message: 'Permit is already being assessed by another user' });
        }

        permit.lockedBy = userId;
        permit.lockTimestamp = new Date();
        await permit.save();

        res.status(200).json({message: 'Permit locked successfully'});
    }
    catch (error) {
        res.status(500).json({ message: 'Error locking permit', error });
    }
};

const unlockWorkPermit = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;
    try {
        const permit = await WorkPermit.findById(id);
        if (!permit) {
            return res.status(404).json({ message: 'Permit not found'});
        }
        if (permit.lockedBy !== userId) {
            return res.status(403).json({ message: 'You do not have permission to unlock this permit' });
        }
        permit.lockedBy = null;
        permit.lockTimestamp = null;
        await permit.save();

        res.status(200).json({ message: 'Permit unlocked successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error unlocking permit', error });
    }
}

module.exports = {
    lockBusinessPermit,
    unlockBusinessPermit,
    lockWorkPermit,
    unlockWorkPermit
};