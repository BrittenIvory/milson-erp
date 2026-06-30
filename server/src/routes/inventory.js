const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const inventoryController = require('../controllers/inventoryController');

router.use(authenticate);

router.get('/', authorize('inventory', 'read'), inventoryController.list);
router.get('/transactions', authorize('inventory', 'read'), inventoryController.transactions);
router.get('/:partId', authorize('inventory', 'read'), inventoryController.getByPartId);
router.put('/:partId/adjust', authorize('inventory', 'update'), inventoryController.adjust);

module.exports = router;
