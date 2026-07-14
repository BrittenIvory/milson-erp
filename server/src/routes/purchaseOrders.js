const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { auditLog, captureOldValues } = require('../middleware/audit');
const { PurchaseOrder } = require('../models');
const purchaseOrderController = require('../controllers/purchaseOrderController');

const audit = auditLog('PurchaseOrder');

router.use(authenticate);

router.get('/', authorize('purchase_orders', 'read'), purchaseOrderController.list);
router.get('/:id', authorize('purchase_orders', 'read'), purchaseOrderController.getById);
router.post('/', authorize('purchase_orders', 'create'), audit('create'), purchaseOrderController.create);
router.put('/:id', authorize('purchase_orders', 'update'), captureOldValues(PurchaseOrder), audit('update'), purchaseOrderController.update);
router.put('/:id/status', authorize('purchase_orders', 'update'), audit('update'), purchaseOrderController.updateStatus);
router.delete('/:id', authorize('purchase_orders', 'delete'), audit('delete'), purchaseOrderController.cancel);

module.exports = router;
