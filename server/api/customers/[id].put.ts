import { useDb } from '../../database'
import * as schema from '../../database/schema'
import { eq } from 'drizzle-orm'
import { updateCustomerSchema } from '../../utils/validation'
import { requireUserSession } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const db = useDb()
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Customer ID is required' })
  }

  const body = await readBody(event)
  const parseResult = updateCustomerSchema.safeParse(body)

  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: parseResult.error.flatten()
    })
  }

  const existing = await db.query.customers.findFirst({
    where: eq(schema.customers.id, id)
  })

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Customer not found' })
  }

  const data = parseResult.data
  const updatePayload: Record<string, any> = {
    updatedAt: new Date()
  }

  if (data.name !== undefined) updatePayload.name = data.name
  if (data.phone !== undefined) updatePayload.phone = data.phone
  if (data.email !== undefined) updatePayload.email = data.email || null
  if (data.address !== undefined) updatePayload.address = data.address || null

  if (data.smsMarketingOptIn !== undefined) {
    updatePayload.smsMarketingOptIn = data.smsMarketingOptIn
    if (data.smsMarketingOptIn && !existing.smsMarketingOptIn) {
      updatePayload.consentedAt = new Date()
      if (data.consentSource) {
        updatePayload.consentSource = data.consentSource
      }
    }
  }

  if (data.smsOptedOut !== undefined) {
    updatePayload.smsOptedOut = data.smsOptedOut
  }

  if (data.consentSource !== undefined) {
    updatePayload.consentSource = data.consentSource
  }

  await db.update(schema.customers).set(updatePayload).where(eq(schema.customers.id, id))

  return { success: true }
})
