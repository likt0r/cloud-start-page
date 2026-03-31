import { sql, relations } from 'drizzle-orm'
import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  icon: text('icon').notNull(),
  sortOrder: integer('sort_order').notNull().default(0)
})

export const services = sqliteTable('services', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  categoryId: integer('category_id')
    .notNull()
    .references(() => categories.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  imagePath: text('image_path'),
  url: text('url').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`)
})

export const serviceAccessGroups = sqliteTable(
  'service_access_groups',
  {
    serviceId: integer('service_id')
      .notNull()
      .references(() => services.id, { onDelete: 'cascade' }),
    keycloakGroup: text('keycloak_group').notNull()
  },
  t => [primaryKey({ columns: [t.serviceId, t.keycloakGroup] })]
)

export const groups = sqliteTable('groups', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique()
})

export const companionApps = sqliteTable('companion_apps', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  serviceId: integer('service_id')
    .notNull()
    .references(() => services.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  platform: text('platform'),
  storeUrl: text('store_url'),
  icon: text('icon')
})

export const categoriesRelations = relations(categories, ({ many }) => ({
  services: many(services)
}))

export const servicesRelations = relations(services, ({ one, many }) => ({
  category: one(categories, {
    fields: [services.categoryId],
    references: [categories.id]
  }),
  accessGroups: many(serviceAccessGroups),
  companionApps: many(companionApps)
}))

export const serviceAccessGroupsRelations = relations(serviceAccessGroups, ({ one }) => ({
  service: one(services, {
    fields: [serviceAccessGroups.serviceId],
    references: [services.id]
  })
}))

export const companionAppsRelations = relations(companionApps, ({ one }) => ({
  service: one(services, {
    fields: [companionApps.serviceId],
    references: [services.id]
  })
}))
