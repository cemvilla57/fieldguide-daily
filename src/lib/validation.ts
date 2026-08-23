import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(1),
  organizationName: z.string().min(1),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type SignupInput = z.infer<typeof SignupSchema>;

export const CreateDailyUpdateSchema = z.object({
  projectId: z.string(),
  content: z.string().min(1),
});

export const CreateLeadSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
  projectDescription: z.string().optional(),
  status: z.string().optional(),
  assignedTo: z.string().optional(),
  followUpDate: z.string().optional(),
  estimatedValue: z.number().optional(),
});

export const UpdateLeadSchema = CreateLeadSchema.partial();

export type CreateLeadInput = z.infer<typeof CreateLeadSchema>;
export type UpdateLeadInput = z.infer<typeof UpdateLeadSchema>;

export const CreateProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  location: z.string().optional(),
  budget: z.number().optional(),
});

export const UpdateProjectSchema = CreateProjectSchema.partial();

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
