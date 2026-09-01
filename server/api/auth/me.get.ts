import { requireUserSession } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  return {
    user: session.user
  }
})
