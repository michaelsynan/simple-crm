import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null

export function useDb() {
  if (_db) return _db

  const url = process.env.TURSO_DATABASE_URL || 'file:local.db'
  const authToken = process.env.TURSO_AUTH_TOKEN

  const client = createClient({
    url,
    authToken
  })

  _db = drizzle(client, { schema })
  return _db
}
