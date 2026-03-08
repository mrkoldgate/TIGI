import { z } from 'zod'

// ---------------------------------------------------------------------------
// Auth validation schemas — shared by API routes and client-side forms.
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
})

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name must be under 80 characters')
    .trim(),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/[A-Z]/, 'Include at least one uppercase letter')
    .regex(/[0-9]/, 'Include at least one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const onboardingRoleSchema = z.object({
  role: z.enum(['INVESTOR', 'OWNER', 'BOTH'], {
    required_error: 'Select at least one role',
  }),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type OnboardingRoleInput = z.infer<typeof onboardingRoleSchema>
