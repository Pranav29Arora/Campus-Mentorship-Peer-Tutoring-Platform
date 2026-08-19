const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Authentication required.'
      });
    }

    const hasRole = allowedRoles.includes(req.user.role);
    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permissions to perform this action.'
      });
    }

    next();
  };
};

module.exports = roleMiddleware;
