import { useDb } from '../../database'
import * as schema from '../../database/schema'
import { createCustomerSchema } from '../../utils/validation'
import { requireUserSession } from '../../utils/auth'
import { randomUUID } from 'crypto'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const db = useDb()

  const body = await readBody(event)
  const parseResult = createCustomerSchema.safeParse(body)

  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: parseResult.error.flatten()
    })
  }

  const { name, phone, email, address, smsMarketingOptIn, consentSource, jobType, jobDate, jobNotes } = parseResult.data

  const customerId = randomUUID()
  const now = new Date()

  // 1. Insert customer
  await db.insert(schema.customers).values({
    id: customerId,
    name,
    phone,
    email: email || null,
    address: address || null,
    smsMarketingOptIn,
    smsOptedOut: false,
    consentSource: smsMarketingOptIn ? (consentSource || 'Other') : null,
    consentedAt: smsMarketingOptIn ? now : null,
    createdAt: now,
    updatedAt: now
  })

  // 2. Insert initial job
  const jobId = randomUUID()
  await db.insert(schema.jobs).values({
    id: jobId,
    customerId,
    jobType,
    jobDate,
    notes: jobNotes || null,
    createdAt: now
  })

  return {
    success: true,
    customerId,
    jobId
  }
})
