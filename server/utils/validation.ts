import { z } from 'zod'

export const ConsentSourceEnum = z.enum(['In person', 'Phone', 'Website', 'Other'])

export const JobTypeEnum = z.enum([
  'Sewer cleaning',
  'Drain cleaning',
  'Sewer inspection',
  'Sewer repair',
  'Emergency service',
  'Other'
])

export const AudienceTypeEnum = z.enum([
  'all_opted_in',
  'no_job_6_months',
  'no_job_12_months',
  'sewer_cleaning',
  'drain_cleaning',
  'sewer_inspection',
  'emergency_service'
])

// Create Customer Schema (includes initial job if created from New Customer form)
export const createCustomerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  phone: z.string().trim().min(7, 'A valid mobile phone is required'),
  email: z.string().trim().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().trim().optional().or(z.literal('')),
  smsMarketingOptIn: z.boolean(),
  consentSource: ConsentSourceEnum.optional(),
  // Initial Job fields
  jobType: JobTypeEnum,
  jobDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  jobNotes: z.string().trim().optional().or(z.literal(''))
})

// Update Customer Schema
export const updateCustomerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').optional(),
  phone: z.string().trim().min(7, 'A valid mobile phone is required').optional(),
  email: z.string().trim().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().trim().optional().or(z.literal('')),
  smsMarketingOptIn: z.boolean().optional(),
  smsOptedOut: z.boolean().optional(),
  consentSource: ConsentSourceEnum.optional()
})

// Create Job Schema
export const createJobSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  jobType: JobTypeEnum,
  jobDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  notes: z.string().trim().optional().or(z.literal(''))
})

// Create Campaign Schema
export const createCampaignSchema = z.object({
  name: z.string().trim().min(1, 'Campaign name is required'),
  message: z.string().trim().min(1, 'SMS message is required'),
  audienceType: AudienceTypeEnum
})
