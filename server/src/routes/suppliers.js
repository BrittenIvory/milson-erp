const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { auditLog, captureOldValues } = require('../middleware/audit');
const { Supplier } = require('../models');
const supplierController = require('../controllers/supplierController');

const audit = auditLog('Supplier');

router.use(authenticate);

router.get('/', authorize('suppliers', 'read'), supplierController.list);
router.get('/:id', authorize('suppliers', 'read'), supplierController.getById);
router.post('/', authorize('suppliers', 'create'), audit('create'), supplierController.create);
router.put('/:id', authorize('suppliers', 'update'), captureOldValues(Supplier), audit('update'), supplierController.update);
router.delete('/:id', authorize('suppliers', 'delete'), audit('delete'), supplierController.deactivate);

router.get('/:id/prices', authorize('supplier_prices', 'read'), supplierController.getPrices);
router.post('/:id/prices', authorize('supplier_prices', 'create'), supplierController.setPrices);

module.exports = router;
