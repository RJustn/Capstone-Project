const mongoose = require('mongoose');
const { WorkPermit, BusinessPermit } = require('../../index/models');

const lockBusinessPermit = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid permit ID format' });
    }

    try {
        // ATOMIC: Only update if not locked or locked by this user
        const permit = await BusinessPermit.findOneAndUpdate(
            { _id: id, $or: [{ lockedBy: null }, { lockedBy: userId }] },
            { lockedBy: userId, lockTimestamp: new Date() },
            { new: true }
        );

        if (!permit) {
            return res.status(403).json({ message: 'Permit is already being assessed by another user' });
        }

        res.status(200).json({ message: 'Permit locked successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error locking permit', error });
    }
};

const unlockBusinessPermit = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;
    try {
        const permit = await BusinessPermit.findById(id);
        if (!permit) {
            return res.status(404).json({ message: 'Permit not found' });
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
};

const lockWorkPermit = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;
    try {
        const permit = await WorkPermit.findOneAndUpdate(
            { _id: id, $or: [{ lockedBy: null }, { lockedBy: userId }] },
            { lockedBy: userId, lockTimestamp: new Date() },
            { new: true }
        );

        if (!permit) {
            return res.status(403).json({ message: 'Permit is already being assessed by another user' });
        }

        res.status(200).json({ message: 'Permit locked successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error locking permit', error });
    }
};

const unlockWorkPermit = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;
    try {
        const permit = await WorkPermit.findById(id);
        if (!permit) {
            return res.status(404).json({ message: 'Permit not found' });
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
};

module.exports = {
    lockBusinessPermit,
    unlockBusinessPermit,
    lockWorkPermit,
    unlockWorkPermit
};