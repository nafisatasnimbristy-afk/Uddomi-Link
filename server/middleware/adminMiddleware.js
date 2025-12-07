const requireAdmin = (req, res, next) => {
    if (req.user && req.user.roles && req.user.roles.includes('admin')) {
        next();
    } else {
        res.status(403).json({
            message: 'Access denied. Admin privileges required.'
        });
    }
};

module.exports = { requireAdmin };
