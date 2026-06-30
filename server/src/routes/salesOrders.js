const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { auditLog, captureOldValues } = require('../middleware/audit');
const { SalesOrder } = require('../models');
const salesOrderController = require('../controllers/salesOrderController');

const audit = auditLog('SalesOrder');

router.use(authenticate);

router.get('/', authorize('sales_orders', 'read'), salesOrderController.list);
router.get('/:id', authorize('sales_orders', 'read'), salesOrderController.getById);
router.post('/', authorize('sales_orders', 'create'), audit('create'), salesOrderController.create);
router.put('/:id', authorize('sales_orders', 'update'), captureOldValues(SalesOrder), audit('update'), salesOrderController.update);
router.put('/:id/status', authorize('sales_orders', 'update'), audit('update'), salesOrderController.updateStatus);
router.delete('/:id', authorize('sales_orders', 'delete'), audit('delete'), salesOrderController.cancel);

module.exports = router;
