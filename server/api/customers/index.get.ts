import { useDb } from '../../database'
import * as schema from '../../database/schema'
import { like, or, desc, sql } from 'drizzle-orm'
import { requireUserSession } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const db = useDb()

  const query = getQuery(event)
  const search = typeof query.search === 'string' ? query.search.trim() : ''

  // Fetch customers with their jobs to get last job date
  const customerList = await db.query.customers.findMany({
    where: search
      ? or(
          like(schema.customers.name, `%${search}%`),
          like(schema.customers.phone, `%${search}%`),
          like(schema.customers.email, `%${search}%`)
        )
      : undefined,
    with: {
      jobs: {
        orderBy: (jobs, { desc }) => [desc(jobs.jobDate), desc(jobs.createdAt)]
      }
    },
    orderBy: [desc(schema.customers.createdAt)]
  })

  return customerList.map((c) => {
    const lastJob = c.jobs?.[0]
    return {
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email,
      address: c.address,
      smsMarketingOptIn: c.smsMarketingOptIn,
      smsOptedOut: c.smsOptedOut,
      consentSource: c.consentSource,
      consentedAt: c.consentedAt,
      createdAt: c.createdAt,
      lastJobDate: lastJob ? lastJob.jobDate : null,
      jobsCount: c.jobs?.length || 0
    }
  })
})
