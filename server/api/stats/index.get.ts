import { useDb } from '../../database'
import { requireUserSession } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const db = useDb()

  const allCustomers = await db.query.customers.findMany({
    with: {
      jobs: {
        orderBy: (jobs, { desc }) => [desc(jobs.jobDate), desc(jobs.createdAt)]
      }
    }
  })

  const totalCustomers = allCustomers.length
  const smsOptedIn = allCustomers.filter(c => c.smsMarketingOptIn && !c.smsOptedOut).length
  const smsOptedOut = allCustomers.filter(c => c.smsOptedOut).length

  // Calculate 12+ months inactive
  const now = new Date()
  const twelveMonthsAgo = new Date(now)
  twelveMonthsAgo.setFullYear(now.getFullYear() - 1)
  const twelveMonthsAgoStr = twelveMonthsAgo.toISOString().split('T')[0] || ''

  const noJob12Months = allCustomers.filter((c) => {
    // Only count opted-in eligible for campaign
    if (!c.smsMarketingOptIn || c.smsOptedOut) return false
    if (!c.jobs || c.jobs.length === 0) return true
    const lastJob = c.jobs[0]
    return Boolean(lastJob && lastJob.jobDate < twelveMonthsAgoStr)
  }).length

  const allCampaigns = await db.query.campaigns.findMany()
  const totalCampaigns = allCampaigns.length

  // Recent 5 customers for Frank's home screen
  const recentCustomers = allCustomers.slice(0, 5).map(c => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    lastJobDate: c.jobs?.[0]?.jobDate || null
  }))

  return {
    totalCustomers,
    smsOptedIn,
    smsOptedOut,
    totalCampaigns,
    noJob12Months,
    recentCustomers
  }
})
