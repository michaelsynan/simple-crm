import { useDb } from '../../database'
import * as schema from '../../database/schema'
import { eq, desc } from 'drizzle-orm'
import { requireUserSession } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const db = useDb()
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Customer ID is required' })
  }

  const customer = await db.query.customers.findFirst({
    where: eq(schema.customers.id, id),
    with: {
      jobs: {
        orderBy: (jobs, { desc: d }) => [d(jobs.jobDate), d(jobs.createdAt)]
      },
      smsMessages: {
        orderBy: (sms, { desc: d }) => [d(sms.createdAt)]
      }
    }
  })

  if (!customer) {
    throw createError({ statusCode: 404, statusMessage: 'Customer not found' })
  }

  return customer
})
