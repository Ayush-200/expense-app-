const express = require('express');
const expenseController = require('../controllers/expenseController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware.protect);

router.post('/create', expenseController.create);
router.get('/group/:groupId', expenseController.getByGroup);
router.get('/group/:groupId/details', expenseController.getGroupDetails);
router.delete('/:expenseId', expenseController.delete);

module.exports = router;
