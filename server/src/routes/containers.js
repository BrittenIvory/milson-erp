const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { auditLog, captureOldValues } = require('../middleware/audit');
const { Container } = require('../models');
const containerController = require('../controllers/containerController');

const audit = auditLog('Container');

router.use(authenticate);

router.get('/', authorize('containers', 'read'), containerController.list);
router.get('/:id', authorize('containers', 'read'), containerController.getById);
router.post('/', authorize('containers', 'create'), audit('create'), containerController.create);
router.put('/:id', authorize('containers', 'update'), captureOldValues(Container), audit('update'), containerController.update);
router.post('/:id/lines', authorize('containers', 'update'), containerController.addLine);
router.delete('/:id/lines/:lineId', authorize('containers', 'update'), containerController.removeLine);
router.post('/:id/receive', authorize('purchase_receipts', 'create'), audit('create'), containerController.receive);

module.exports = router;
