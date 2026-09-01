import { useDb } from './index'
import * as schema from './schema'
import { eq } from 'drizzle-orm'
import { auth } from './auth'

export async function seedInitialUsers(event?: any) {
  const db = useDb()
  const users = await db.select().from(schema.user).limit(1)

  if (users.length === 0) {
    console.log('[Primo Admin] Seeding initial Frank and Admin users...')
    try {
      // Create Frank
      await auth.api.signUpEmail({
        body: {
          name: 'Frank (Primo Sewer)',
          email: 'frank@primosewer.com',
          password: 'projects2026'
        }
      })

      // Create Admin
      await auth.api.signUpEmail({
        body: {
          name: 'Primo Admin',
          email: 'admin@primosewer.com',
          password: 'projects2026'
        }
      })

      // Update role for Admin
      await db.update(schema.user).set({ role: 'admin' }).where(eq(schema.user.email, 'admin@primosewer.com'))
      await db.update(schema.user).set({ role: 'frank' }).where(eq(schema.user.email, 'frank@primosewer.com'))

      console.log('[Primo Admin] Seeded Frank (frank@primosewer.com) and Admin (admin@primosewer.com)')
    } catch (err) {
      console.error('[Primo Admin] Error during user seed:', err)
    }
  }
}
