import { useDb } from '../database'
import * as schema from '../database/schema'
import { eq, and } from 'drizzle-orm'

export async function getAudienceCustomers(audienceType: string) {
  const db = useDb()

  // Base filter: MUST be opted in and NOT opted out
  const baseCondition = and(
    eq(schema.customers.smsMarketingOptIn, true),
    eq(schema.customers.smsOptedOut, false)
  )

  const allEligible = await db.query.customers.findMany({
    where: baseCondition,
    with: {
      jobs: {
        orderBy: (jobs, { desc }) => [desc(jobs.jobDate), desc(jobs.createdAt)]
      }
    }
  })

  const now = new Date()

  switch (audienceType) {
    case 'all_opted_in':
      return allEligible

    case 'no_job_6_months': {
      const sixMonthsAgo = new Date(now)
      sixMonthsAgo.setMonth(now.getMonth() - 6)
      const sixMonthsAgoStr = sixMonthsAgo.toISOString().split('T')[0] || ''

      return allEligible.filter((cust) => {
        if (!cust.jobs || cust.jobs.length === 0) return true
        const lastJob = cust.jobs[0]
        return Boolean(lastJob && lastJob.jobDate < sixMonthsAgoStr)
      })
    }

    case 'no_job_12_months': {
      const twelveMonthsAgo = new Date(now)
      twelveMonthsAgo.setFullYear(now.getFullYear() - 1)
      const twelveMonthsAgoStr = twelveMonthsAgo.toISOString().split('T')[0] || ''

      return allEligible.filter((cust) => {
        if (!cust.jobs || cust.jobs.length === 0) return true
        const lastJob = cust.jobs[0]
        return Boolean(lastJob && lastJob.jobDate < twelveMonthsAgoStr)
      })
    }

    case 'sewer_cleaning':
      return allEligible.filter((cust) =>
        cust.jobs?.some((j) => j.jobType.toLowerCase().includes('sewer cleaning'))
      )

    case 'drain_cleaning':
      return allEligible.filter((cust) =>
        cust.jobs?.some((j) => j.jobType.toLowerCase().includes('drain cleaning'))
      )

    case 'sewer_inspection':
      return allEligible.filter((cust) =>
        cust.jobs?.some((j) => j.jobType.toLowerCase().includes('sewer inspection'))
      )

    case 'emergency_service':
      return allEligible.filter((cust) =>
        cust.jobs?.some((j) => j.jobType.toLowerCase().includes('emergency service'))
      )

    default:
      return allEligible
  }
}
