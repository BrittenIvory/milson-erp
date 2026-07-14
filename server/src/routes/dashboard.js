const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const dashboardController = require('../controllers/dashboardController');

router.use(authenticate);
router.use(authorize('dashboard', 'read'));

router.get('/stats', dashboardController.getStats);
router.get('/recent', dashboardController.getRecent);

module.exports = router;
