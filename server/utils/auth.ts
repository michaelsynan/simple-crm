import type { H3Event } from 'h3'
import { auth } from '../database/auth'

export async function requireUserSession(event: H3Event) {
  const session = await auth.api.getSession({
    headers: event.headers
  })

  if (!session || !session.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized. Please log in.'
    })
  }

  return session
}

export async function requireAdminSession(event: H3Event) {
  const session = await requireUserSession(event)
  const user = session.user as { role?: string }

  if (user.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden. Admin privileges required.'
    })
  }

  return session
}
