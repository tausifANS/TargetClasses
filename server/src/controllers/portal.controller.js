import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import * as portalService from '../services/portal.service.js';

export const login = asyncHandler(async (req, res) => {
  const { studentId, dob } = req.body;
  const student = await portalService.findStudent(studentId, dob);

  if (!student) {
    throw ApiError.notFound('No student found with that Student ID and date of birth. Please check the details or contact the institute.');
  }
  if (student.status && String(student.status).toLowerCase() === 'inactive') {
    throw ApiError.forbidden('This student record is currently inactive. Please contact the institute.');
  }

  res.json({ success: true, data: student });
});
