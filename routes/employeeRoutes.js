const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const authenticateToken = require('../middleware/auth');
const {
  employeeValidation,
  employeeUpdateValidation,
  employeeIdParamValidation,
  employeeIdQueryValidation
} = require('../middleware/validators');

router.use(authenticateToken);

router.get('/employees', employeeController.getAllEmployees);
router.post('/employees', employeeValidation, employeeController.createEmployee);
router.get('/employees/:eid', employeeIdParamValidation, employeeController.getEmployeeById);
router.put('/employees/:eid', employeeUpdateValidation, employeeController.updateEmployeeById);
router.delete('/employees', employeeIdQueryValidation, employeeController.deleteEmployeeById);

module.exports = router;
