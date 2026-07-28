import { z } from 'zod';

export const portalLoginSchema = z.object({
  studentId: z.string().min(1, 'Please enter your Student ID'),
  dob: z.string().min(1, 'Please enter date of birth'),
});
