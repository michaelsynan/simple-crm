import { useDb } from '../../database'
import * as schema from '../../database/schema'
import { createJobSchema } from '../../utils/validation'
import { requireUserSession } from '../../utils/auth'
import { randomUUID } from 'crypto'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const db = useDb()

  const body = await readBody(event)
  const parseResult = createJobSchema.safeParse(body)

  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: parseResult.error.flatten()
    })
  }

  const { customerId, jobType, jobDate, notes } = parseResult.data

  const customer = await db.query.customers.findFirst({
    where: eq(schema.customers.id, customerId)
  })

  if (!customer) {
    throw createError({ statusCode: 404, statusMessage: 'Customer not found' })
  }

  const jobId = randomUUID()
  const now = new Date()

  await db.insert(schema.jobs).values({
    id: jobId,
    customerId,
    jobType,
    jobDate,
    notes: notes || null,
    createdAt: now
  })

  // Update customer updatedAt
  await db.update(schema.customers).set({ updatedAt: now }).where(eq(schema.customers.id, customerId))

  return {
    success: true,
    jobId
  }
})
