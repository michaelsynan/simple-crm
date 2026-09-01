import { defineServerAuth } from '@nuxtjs/better-auth/config'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { useDb } from './database'
import * as schema from './database/schema'

export default defineServerAuth({
  database: drizzleAdapter(useDb(), {
    provider: 'sqlite',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification
    }
  }),
  emailAndPassword: {
    enabled: true
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'frank',
        input: false
      }
    }
  }
})
