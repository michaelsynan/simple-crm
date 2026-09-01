import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'
import { relations, sql } from 'drizzle-orm'

// Better Auth tables
export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('emailVerified', { mode: 'boolean' }).notNull(),
  image: text('image'),
  role: text('role').default('frank').notNull(), // 'frank' | 'admin'
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull()
})

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' })
})

export const account = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: integer('accessTokenExpiresAt', { mode: 'timestamp' }),
  refreshTokenExpiresAt: integer('refreshTokenExpiresAt', { mode: 'timestamp' }),
  scope: text('scope'),
  password: text('password'),
  issuer: text('issuer'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull()
})

export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }),
  updatedAt: integer('updatedAt', { mode: 'timestamp' })
})

// Primo Admin Core Tables

export const customers = sqliteTable('customers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  address: text('address'),
  smsMarketingOptIn: integer('smsMarketingOptIn', { mode: 'boolean' }).default(false).notNull(),
  smsOptedOut: integer('smsOptedOut', { mode: 'boolean' }).default(false).notNull(),
  consentSource: text('consentSource'), // 'In person' | 'Phone' | 'Website' | 'Other'
  consentedAt: integer('consentedAt', { mode: 'timestamp' }),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull()
}, (table) => [
  index('customer_phone_idx').on(table.phone),
  index('customer_name_idx').on(table.name),
  index('customer_sms_opt_idx').on(table.smsMarketingOptIn, table.smsOptedOut)
])

export const jobs = sqliteTable('jobs', {
  id: text('id').primaryKey(),
  customerId: text('customerId').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  jobType: text('jobType').notNull(), // 'Sewer cleaning' | 'Drain cleaning' | 'Sewer inspection' | 'Sewer repair' | 'Emergency service' | 'Other'
  jobDate: text('jobDate').notNull(), // YYYY-MM-DD format for easy date handling and display
  notes: text('notes'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull()
}, (table) => [
  index('job_customer_id_idx').on(table.customerId),
  index('job_date_idx').on(table.jobDate),
  index('job_type_idx').on(table.jobType)
])

export const campaigns = sqliteTable('campaigns', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  message: text('message').notNull(),
  audienceType: text('audienceType').notNull(),
  status: text('status').default('draft').notNull(), // 'draft' | 'sending' | 'sent' | 'failed'
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  sentAt: integer('sentAt', { mode: 'timestamp' })
})

export const campaignRecipients = sqliteTable('campaignRecipients', {
  id: text('id').primaryKey(),
  campaignId: text('campaignId').notNull().references(() => campaigns.id, { onDelete: 'cascade' }),
  customerId: text('customerId').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  status: text('status').default('queued').notNull(), // 'queued' | 'sent' | 'delivered' | 'failed' | 'undelivered'
  twilioMessageSid: text('twilioMessageSid'),
  sentAt: integer('sentAt', { mode: 'timestamp' })
}, (table) => [
  index('recipient_campaign_idx').on(table.campaignId),
  index('recipient_customer_idx').on(table.customerId),
  index('recipient_twilio_sid_idx').on(table.twilioMessageSid)
])

export const smsMessages = sqliteTable('smsMessages', {
  id: text('id').primaryKey(),
  customerId: text('customerId').references(() => customers.id, { onDelete: 'set null' }),
  campaignId: text('campaignId').references(() => campaigns.id, { onDelete: 'set null' }),
  direction: text('direction').notNull(), // 'inbound' | 'outbound'
  message: text('message').notNull(),
  twilioMessageSid: text('twilioMessageSid'),
  status: text('status').notNull(), // 'received' | 'queued' | 'sent' | 'delivered' | 'failed' | 'undelivered'
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull()
}, (table) => [
  index('sms_customer_idx').on(table.customerId),
  index('sms_twilio_sid_idx').on(table.twilioMessageSid)
])

// Relations
export const customersRelations = relations(customers, ({ many }) => ({
  jobs: many(jobs),
  recipients: many(campaignRecipients),
  smsMessages: many(smsMessages)
}))

export const jobsRelations = relations(jobs, ({ one }) => ({
  customer: one(customers, {
    fields: [jobs.customerId],
    references: [customers.id]
  })
}))

export const campaignsRelations = relations(campaigns, ({ many }) => ({
  recipients: many(campaignRecipients),
  smsMessages: many(smsMessages)
}))

export const campaignRecipientsRelations = relations(campaignRecipients, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaignRecipients.campaignId],
    references: [campaigns.id]
  }),
  customer: one(customers, {
    fields: [campaignRecipients.customerId],
    references: [customers.id]
  })
}))

export const smsMessagesRelations = relations(smsMessages, ({ one }) => ({
  customer: one(customers, {
    fields: [smsMessages.customerId],
    references: [customers.id]
  }),
  campaign: one(campaigns, {
    fields: [smsMessages.campaignId],
    references: [campaigns.id]
  })
}))
