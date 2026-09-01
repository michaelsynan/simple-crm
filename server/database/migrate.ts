import { migrate } from 'drizzle-orm/libsql/migrator'
import { useDb } from './index'

export async function runMigrations() {
  const db = useDb()
  try {
    await migrate(db, { migrationsFolder: './server/database/migrations' })
    console.log('[Primo Admin] Migrations ran successfully.')
  } catch (error) {
    console.error('[Primo Admin] Failed to run migrations:', error)
  }
}
