const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { auditLog } = require('../middleware/audit');
const userController = require('../controllers/userController');

const audit = auditLog('User');

router.use(authenticate);
router.use(authorize('users', 'read'));

router.get('/', userController.list);
router.get('/:id', userController.getById);
router.post('/', authorize('users', 'create'), audit('create'), userController.create);
router.put('/:id', authorize('users', 'update'), audit('update'), userController.update);
router.delete('/:id', authorize('users', 'delete'), audit('delete'), userController.deactivate);

module.exports = router;
