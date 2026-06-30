const { ROLE_PERMISSIONS } = require('../config/permissions');

const authorize = (module, action) => {
  return (req, res, next) => {
    const roleName = req.user.Role ? req.user.Role.name : null;

    if (!roleName) {
      return res.status(403).json({ success: false, error: { message: 'No role assigned' } });
    }

    const permissions = ROLE_PERMISSIONS[roleName];
    if (!permissions) {
      return res.status(403).json({ success: false, error: { message: 'Unknown role' } });
    }

    const modulePerms = permissions[module];
    if (!modulePerms || !modulePerms.includes(action)) {
      return res.status(403).json({
        success: false,
        error: { message: `Access denied: ${roleName} cannot ${action} ${module}` },
      });
    }

    next();
  };
};

module.exports = { authorize };
