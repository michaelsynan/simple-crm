import { requireAdminSession } from '../../utils/auth'
import { getAudienceCustomers } from '../../utils/audience'

export default defineEventHandler(async (event) => {
  await requireAdminSession(event)
  const query = getQuery(event)
  const audienceType = typeof query.audienceType === 'string' ? query.audienceType : 'all_opted_in'

  const recipients = await getAudienceCustomers(audienceType)
  return {
    count: recipients.length,
    sample: recipients.slice(0, 5).map(r => ({ id: r.id, name: r.name, phone: r.phone }))
  }
})
