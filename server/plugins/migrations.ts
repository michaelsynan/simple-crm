import { runMigrations } from '../database/migrate'

export default defineNitroPlugin(async () => {
  await runMigrations()
})
