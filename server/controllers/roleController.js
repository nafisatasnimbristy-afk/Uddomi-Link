const User = require('../models/userModel');

const addRoleToUser = async (req, res) => {
    try {
        const { role } = req.body;

        const validRoles = ['user', 'business-owner', 'investor'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.roles.includes(role)) {
            return res.status(400).json({ message: 'User already has this role' });
        }

        user.roles.push(role);
        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            roles: user.roles,
            message: `Role '${role}' added successfully`
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const removeRoleFromUser = async (req, res) => {
    try {
        const { role } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.roles.length === 1) {
            return res.status(400).json({ message: 'Cannot remove last role' });
        }

        if (!user.roles.includes(role)) {
            return res.status(400).json({ message: 'User does not have this role' });
        }

        user.roles = user.roles.filter(r => r !== role);
        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            roles: user.roles,
            message: `Role '${role}' removed successfully`
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    addRoleToUser,
    removeRoleFromUser
};
