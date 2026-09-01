import { useDb } from '../../../database'
import * as schema from '../../../database/schema'
import { eq, or, like } from 'drizzle-orm'
import { randomUUID } from 'crypto'

export default defineEventHandler(async (event) => {
  const db = useDb()
  const body = await readBody(event).catch(() => ({}))

  // Twilio sends urlencoded or json form data
  const from = body.From || body.from || ''
  const to = body.To || body.to || ''
  const messageBody = (body.Body || body.body || '').trim()
  const messageSid = body.MessageSid || body.messageSid || body.SmsSid || ''
  const messageStatus = (body.MessageStatus || body.messageStatus || body.SmsStatus || '').toLowerCase()

  console.log(`[Primo Admin: Twilio Webhook] Received event. From: ${from}, Sid: ${messageSid}, Status: ${messageStatus}, Body: "${messageBody}"`)

  // 1. If this is a delivery status callback
  if (messageSid && messageStatus && ['delivered', 'failed', 'undelivered', 'sent', 'queued'].includes(messageStatus)) {
    await db.update(schema.campaignRecipients)
      .set({ status: messageStatus })
      .where(eq(schema.campaignRecipients.twilioMessageSid, messageSid))

    await db.update(schema.smsMessages)
      .set({ status: messageStatus })
      .where(eq(schema.smsMessages.twilioMessageSid, messageSid))

    return '<Response></Response>'
  }

  // 2. Inbound SMS message
  if (from && messageBody) {
    // Check if sender matches any customer phone
    // Handle standard E.164 and local format variations
    const cleanFrom = from.replace(/\D/g, '')
    const last10Digits = cleanFrom.slice(-10)

    const matchingCustomer = await db.query.customers.findFirst({
      where: or(
        eq(schema.customers.phone, from),
        like(schema.customers.phone, `%${last10Digits}`)
      )
    })

    const customerId = matchingCustomer ? matchingCustomer.id : null

    // Check for opt-out keywords (Twilio standard keywords: STOP, STOPALL, UNSUBSCRIBE, CANCEL, END, QUIT)
    const upperBody = messageBody.toUpperCase()
    const optOutKeywords = ['STOP', 'STOPALL', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT']
    const isOptOut = optOutKeywords.includes(upperBody)

    // Check for opt-in keywords (START, YES, UNSTOP)
    const optInKeywords = ['START', 'YES', 'UNSTOP']
    const isOptIn = optInKeywords.includes(upperBody)

    if (matchingCustomer && isOptOut) {
      console.log(`[Primo Admin] Customer ${matchingCustomer.name} (${matchingCustomer.phone}) OPTED OUT via SMS.`)
      await db.update(schema.customers)
        .set({ smsOptedOut: true, updatedAt: new Date() })
        .where(eq(schema.customers.id, matchingCustomer.id))
    } else if (matchingCustomer && isOptIn) {
      console.log(`[Primo Admin] Customer ${matchingCustomer.name} (${matchingCustomer.phone}) OPTED IN / RESUBSCRIBED via SMS.`)
      await db.update(schema.customers)
        .set({ smsOptedOut: false, smsMarketingOptIn: true, consentedAt: new Date(), consentSource: 'Phone', updatedAt: new Date() })
        .where(eq(schema.customers.id, matchingCustomer.id))
    }

    // Record inbound message
    await db.insert(schema.smsMessages).values({
      id: randomUUID(),
      customerId,
      direction: 'inbound',
      message: messageBody,
      twilioMessageSid: messageSid || null,
      status: 'received',
      createdAt: new Date()
    })
  }

  // Return standard TwiML response
  setHeader(event, 'Content-Type', 'text/xml')
  return '<Response></Response>'
})
