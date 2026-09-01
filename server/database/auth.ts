import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { useDb } from './index'
import * as schema from './schema'

export const auth = betterAuth({
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
