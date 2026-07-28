import { asyncHandler } from '../utils/asyncHandler.js';
import * as sheetsService from '../services/sheets.service.js';

export const submitAdmission = asyncHandler(async (req, res) => {
  const b = req.body;
  await sheetsService.appendRow('Admissions', {
    StudentName: b.studentName,
    DOB: b.dob,
    ApplyingFor: b.applyingFor,
    ParentName: b.parentName,
    Phone: b.phone,
    Email: b.email || '',
    Address: b.address,
    Message: b.message || '',
    Status: 'New',
  });
  res.status(201).json({ success: true, message: 'Admission inquiry received' });
});

export const submitContact = asyncHandler(async (req, res) => {
  const b = req.body;
  await sheetsService.appendRow('ContactMessages', {
    Name: b.name,
    Phone: b.phone,
    Email: b.email || '',
    Message: b.message,
    Status: 'New',
  });
  res.status(201).json({ success: true, message: 'Message received' });
});

export const submitSupport = asyncHandler(async (req, res) => {
  const b = req.body;
  await sheetsService.appendRow('SupportRequests', {
    Name: b.name,
    Phone: b.phone,
    Topic: b.topic,
    Message: b.message,
    Status: 'New',
  });
  res.status(201).json({ success: true, message: 'Support request received' });
});

export const submitCareer = asyncHandler(async (req, res) => {
  const b = req.body;
  await sheetsService.appendRow('CareerApplications', {
    Name: b.name,
    Phone: b.phone,
    Email: b.email || '',
    Message: b.message,
    Status: 'New',
  });
  res.status(201).json({ success: true, message: 'Application received' });
});

export const submitTestimonial = asyncHandler(async (req, res) => {
  const b = req.body;
  await sheetsService.appendRow('Testimonials', {
    ParentName: b.parentName,
    StudentName: b.studentName || '',
    Message: b.message,
    Rating: b.rating || '',
    Published: false,
  });
  res.status(201).json({ success: true, message: 'Thank you for sharing your feedback' });
});
