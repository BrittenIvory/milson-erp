const { AuditLog, User } = require('../models');
const { getPagination, formatPaginatedResponse } = require('../utils/pagination');

const list = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const where = {};

    if (req.query.entity_type) {
      where.entity_type = req.query.entity_type;
    }

    if (req.query.user_id) {
      where.user_id = req.query.user_id;
    }

    if (req.query.action) {
      where.action = req.query.action;
    }

    const data = await AuditLog.findAndCountAll({
      where,
      include: [
        { model: User, attributes: ['id', 'username', 'first_name', 'last_name'] },
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    return res.json(formatPaginatedResponse(data, page, limit));
  } catch (err) {
    next(err);
  }
};

module.exports = { list };
