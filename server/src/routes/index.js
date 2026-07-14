const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/users', require('./users'));
router.use('/parts', require('./parts'));
router.use('/suppliers', require('./suppliers'));
router.use('/customers', require('./customers'));
router.use('/sales-orders', require('./salesOrders'));
router.use('/purchase-orders', require('./purchaseOrders'));
router.use('/containers', require('./containers'));
router.use('/purchase-receipts', require('./purchaseReceipts'));
router.use('/inventory', require('./inventory'));
router.use('/dashboard', require('./dashboard'));
router.use('/audit-logs', require('./auditLogs'));

module.exports = router;
