const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const auditLogController = require('../controllers/auditLogController');

router.use(authenticate);
router.use(authorize('audit_logs', 'read'));

router.get('/', auditLogController.list);

module.exports = router;
