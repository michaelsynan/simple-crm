import { seedInitialUsers } from '../database/seed'

export default defineNitroPlugin(async () => {
  // Automatically ensure Frank and Admin test users exist on boot
  await seedInitialUsers()
})
