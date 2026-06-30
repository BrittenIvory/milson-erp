const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const purchaseReceiptController = require('../controllers/purchaseReceiptController');

router.use(authenticate);

router.get('/', authorize('purchase_receipts', 'read'), purchaseReceiptController.list);
router.get('/:id', authorize('purchase_receipts', 'read'), purchaseReceiptController.getById);

module.exports = router;
