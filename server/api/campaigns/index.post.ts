import { useDb } from '../../database'
import * as schema from '../../database/schema'
import { createCampaignSchema } from '../../utils/validation'
import { requireAdminSession } from '../../utils/auth'
import { getAudienceCustomers } from '../../utils/audience'
import { sendSmsMessage } from '../../utils/twilio'
import { randomUUID } from 'crypto'

export default defineEventHandler(async (event) => {
  await requireAdminSession(event)
  const db = useDb()

  const body = await readBody(event)
  const parseResult = createCampaignSchema.safeParse(body)

  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: parseResult.error.flatten()
    })
  }

  const { name, message, audienceType } = parseResult.data

  // Fetch recipients strictly opted in and not opted out
  const recipients = await getAudienceCustomers(audienceType)

  if (recipients.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No eligible opted-in recipients found for this audience'
    })
  }

  const campaignId = randomUUID()
  const now = new Date()

  // 1. Create Campaign
  await db.insert(schema.campaigns).values({
    id: campaignId,
    name,
    message,
    audienceType,
    status: 'sending',
    createdAt: now,
    sentAt: now
  })

  // 2. Deliver messages in background / loop
  let successCount = 0
  let failCount = 0

  for (const customer of recipients) {
    const res = await sendSmsMessage(customer.phone, message)
    const recipientId = randomUUID()
    const recipientStatus = res.success ? 'sent' : 'failed'

    await db.insert(schema.campaignRecipients).values({
      id: recipientId,
      campaignId,
      customerId: customer.id,
      status: recipientStatus,
      twilioMessageSid: res.sid || null,
      sentAt: new Date()
    })

    await db.insert(schema.smsMessages).values({
      id: randomUUID(),
      customerId: customer.id,
      campaignId,
      direction: 'outbound',
      message,
      twilioMessageSid: res.sid || null,
      status: recipientStatus,
      createdAt: new Date()
    })

    if (res.success) {
      successCount++
    } else {
      failCount++
    }
  }

  // Update campaign status
  await db.update(schema.campaigns).set({
    status: failCount === recipients.length ? 'failed' : 'sent'
  })

  return {
    success: true,
    campaignId,
    total: recipients.length,
    sent: successCount,
    failed: failCount
  }
})
