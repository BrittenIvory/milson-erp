const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { auditLog, captureOldValues } = require('../middleware/audit');
const { Part } = require('../models');
const partController = require('../controllers/partController');

const audit = auditLog('Part');

router.use(authenticate);

router.get('/', authorize('parts', 'read'), partController.list);
router.get('/:id', authorize('parts', 'read'), partController.getById);
router.post('/', authorize('parts', 'create'), audit('create'), partController.create);
router.put('/:id', authorize('parts', 'update'), captureOldValues(Part), audit('update'), partController.update);
router.delete('/:id', authorize('parts', 'delete'), audit('delete'), partController.deactivate);

module.exports = router;
