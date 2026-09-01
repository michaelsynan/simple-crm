import { useDb } from '../../database'
import * as schema from '../../database/schema'
import { desc } from 'drizzle-orm'
import { requireAdminSession } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdminSession(event)
  const db = useDb()

  const allCampaigns = await db.query.campaigns.findMany({
    orderBy: [desc(schema.campaigns.createdAt)],
    with: {
      recipients: true
    }
  })

  return allCampaigns.map((camp) => {
    const totalRecipients = camp.recipients.length
    const deliveredCount = camp.recipients.filter(r => r.status === 'delivered' || r.status === 'sent').length
    const failedCount = camp.recipients.filter(r => r.status === 'failed' || r.status === 'undelivered').length
    const queuedCount = camp.recipients.filter(r => r.status === 'queued').length

    return {
      id: camp.id,
      name: camp.name,
      message: camp.message,
      audienceType: camp.audienceType,
      status: camp.status,
      createdAt: camp.createdAt,
      sentAt: camp.sentAt,
      stats: {
        total: totalRecipients,
        delivered: deliveredCount,
        failed: failedCount,
        queued: queuedCount
      }
    }
  })
})
