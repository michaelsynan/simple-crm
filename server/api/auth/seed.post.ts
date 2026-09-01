import { seedInitialUsers } from '../../database/seed'

export default defineEventHandler(async (event) => {
  await seedInitialUsers(event)
  return { success: true, message: 'Initial accounts created if not existing' }
})
