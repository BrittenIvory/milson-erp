const { AuditLog } = require('../models');

const auditLog = (entityType) => {
  return (action) => {
    return async (req, res, next) => {
      const originalJson = res.json.bind(res);

      res.json = async (data) => {
        if (res.statusCode >= 200 && res.statusCode < 300 && data.success) {
          try {
            await AuditLog.create({
              user_id: req.user ? req.user.id : null,
              action,
              entity_type: entityType,
              entity_id: data.data ? data.data.id : (req.params.id || null),
              old_values: req.auditOldValues || null,
              new_values: action === 'delete' ? null : (req.body || null),
              ip_address: req.ip,
            });
          } catch (err) {
            console.error('Audit log error:', err.message);
          }
        }
        return originalJson(data);
      };

      next();
    };
  };
};

const captureOldValues = (Model) => {
  return async (req, res, next) => {
    if (req.params.id) {
      try {
        const record = await Model.findByPk(req.params.id);
        if (record) {
          req.auditOldValues = record.toJSON();
        }
      } catch (err) {
        console.error('Capture old values error:', err.message);
      }
    }
    next();
  };
};

module.exports = { auditLog, captureOldValues };
