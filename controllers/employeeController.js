const Employee = require('../models/Employee');
const logger = require('../utils/logger');

exports.getAllEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.find({ user: req.user.id }).select('-user');
    logger.info('FETCH_EMPLOYEES_SUCCESS', { userId: req.user.id, count: employees.length });
    return res.status(200).json(employees);
  } catch (error) {
    next(error);
  }
};

exports.createEmployee = async (req, res, next) => {
  try {
    const employeeData = { ...req.body, user: req.user.id };
    const employee = new Employee(employeeData);
    await employee.save();

    logger.info('EMPLOYEE_CREATED', { employeeId: employee._id, ownerId: req.user.id });
    return res.status(201).json({ message: 'Employee created successfully.', employee_id: employee._id });
  } catch (error) {
    next(error);
  }
};

exports.getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ _id: req.params.eid, user: req.user.id });
    if (!employee) {
      const existsOtherUser = await Employee.findById(req.params.eid);
      if (existsOtherUser) {
        logger.warn('CROSS_USER_ACCESS_BLOCKED', { requestingUser: req.user.id, targetEmployee: req.params.eid });
        return res.status(403).json({ status: false, message: 'Forbidden. You do not own this employee.' });
      }
      return res.status(404).json({ status: false, message: 'Employee not found.' });
    }
    return res.status(200).json(employee);
  } catch (error) {
    next(error);
  }
};

exports.updateEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ _id: req.params.eid, user: req.user.id });
    if (!employee) {
      const existsOtherUser = await Employee.findById(req.params.eid);
      if (existsOtherUser) {
        logger.warn('CROSS_USER_UPDATE_BLOCKED', { requestingUser: req.user.id, targetEmployee: req.params.eid });
        return res.status(403).json({ status: false, message: "Forbidden. You cannot update another user's employee." });
      }
      return res.status(404).json({ status: false, message: 'Employee not found.' });
    }
    Object.assign(employee, req.body);
    await employee.save();

    logger.info('EMPLOYEE_UPDATED', { employeeId: employee._id, userId: req.user.id });
    return res.status(200).json({ message: 'Employee details updated successfully.' });
  } catch (error) {
    next(error);
  }
};

exports.deleteEmployeeById = async (req, res, next) => {
  try {
    const { eid } = req.query;
    const employee = await Employee.findOne({ _id: eid, user: req.user.id });
    if (!employee) {
      const existsOtherUser = await Employee.findById(eid);
      if (existsOtherUser) {
        logger.warn('CROSS_USER_DELETE_BLOCKED', { requestingUser: req.user.id, targetEmployee: eid });
        return res.status(403).json({ status: false, message: "Forbidden. You cannot delete another user's employee." });
      }
      return res.status(404).json({ status: false, message: 'Employee not found.' });
    }
    await Employee.deleteOne({ _id: eid, user: req.user.id });
    logger.info('EMPLOYEE_DELETED', { employeeId: eid, userId: req.user.id });
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
