const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { auditLog, captureOldValues } = require('../middleware/audit');
const { Customer } = require('../models');
const customerController = require('../controllers/customerController');

const audit = auditLog('Customer');

router.use(authenticate);

router.get('/', authorize('customers', 'read'), customerController.list);
router.get('/:id', authorize('customers', 'read'), customerController.getById);
router.post('/', authorize('customers', 'create'), audit('create'), customerController.create);
router.put('/:id', authorize('customers', 'update'), captureOldValues(Customer), audit('update'), customerController.update);
router.delete('/:id', authorize('customers', 'delete'), audit('delete'), customerController.deactivate);

router.get('/:id/prices', authorize('customer_prices', 'read'), customerController.getPrices);
router.post('/:id/prices', authorize('customer_prices', 'create'), customerController.setPrices);

module.exports = router;
