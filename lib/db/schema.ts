import { relations } from "drizzle-orm";
import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";

/** Matches Turso tables created by scripts/seed-admin.ts (camelCase columns). */
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "boolean" }),
  image: text("image"),
  createdAt: text("createdAt"),
  updatedAt: text("updatedAt"),
  role: text("role"),
  banned: integer("banned", { mode: "boolean" }),
  banReason: text("banReason"),
  banExpires: text("banExpires"),
});

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => user.id),
    token: text("token").notNull().unique(),
    expiresAt: text("expiresAt").notNull(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    createdAt: text("createdAt"),
    updatedAt: text("updatedAt"),
    impersonatedBy: text("impersonatedBy"),
    activeOrganizationId: text("activeOrganizationId"),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => user.id),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    accessTokenExpiresAt: text("accessTokenExpiresAt"),
    refreshTokenExpiresAt: text("refreshTokenExpiresAt"),
    scope: text("scope"),
    idToken: text("idToken"),
    password: text("password"),
    createdAt: text("createdAt"),
    updatedAt: text("updatedAt"),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: text("expiresAt").notNull(),
    createdAt: text("createdAt"),
    updatedAt: text("updatedAt"),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const analyticsEvents = sqliteTable(
  "analytics_events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    event: text("event").notNull(),
    path: text("path"),
    brand: text("brand"),
    model: text("model"),
    meta: text("meta"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (t) => [
    index("ae_event_idx").on(t.event),
    index("ae_created_idx").on(t.createdAt),
    index("ae_brand_idx").on(t.brand),
  ]
);

export const auditLog = sqliteTable(
  "audit_log",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id").notNull(),
    userName: text("user_name"),
    action: text("action").notNull(),
    resource: text("resource").notNull(),
    resourceId: text("resource_id"),
    details: text("details"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (t) => [
    index("audit_user_idx").on(t.userId),
    index("audit_resource_idx").on(t.resource),
    index("audit_created_idx").on(t.createdAt),
  ]
);

// ── Properties (hot cache synced from Notion) ─────────────────────────────────
export const properties = sqliteTable(
  "properties",
  {
    id: text("id").primaryKey(),
    notionPageId: text("notionPageId").unique(),
    slug: text("slug").unique(),
    ownerId: text("ownerId").references(() => user.id),
    status: text("status", { enum: ["available", "rented", "coming_soon", "pending", "archived"] }),
    availableFrom: text("availableFrom"),
    address: text("address"),
    city: text("city"),
    district: text("district"),
    lat: real("lat"),
    lng: real("lng"),
    priceTHB: integer("priceTHB"),
    bedrooms: integer("bedrooms"),
    bathrooms: integer("bathrooms"),
    sizeSqm: real("sizeSqm"),
    cloudinaryFolder: text("cloudinaryFolder"),
    hasVirtualTour: integer("hasVirtualTour", { mode: "boolean" }),
    virtualTourUrl: text("virtualTourUrl"),
    algoliaObjectId: text("algoliaObjectId"),
    verifiedAt: text("verifiedAt"),
    approvedAt: text("approvedAt"),
    createdAt: text("createdAt"),
    updatedAt: text("updatedAt"),
  },
  (t) => [
    index("properties_slug_idx").on(t.slug),
    index("properties_ownerId_idx").on(t.ownerId),
    index("properties_status_idx").on(t.status),
    index("properties_city_idx").on(t.city),
  ]
);

// ── Rental Periods ─────────────────────────────────────────────────────────────
export const rentalPeriods = sqliteTable(
  "rental_periods",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    propertyId: text("propertyId").references(() => properties.id),
    tenantName: text("tenantName"),
    startDate: text("startDate").notNull(),
    endDate: text("endDate").notNull(),
    note: text("note"),
    createdAt: text("createdAt"),
  },
  (t) => [index("rental_periods_propertyId_idx").on(t.propertyId)]
);

// ── Nearby Places (Google Places cache) ───────────────────────────────────────
export const nearbyPlaces = sqliteTable(
  "nearby_places",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    propertyId: text("propertyId").references(() => properties.id),
    placeId: text("placeId"),
    name: text("name"),
    category: text("category"),
    distanceKm: real("distanceKm"),
    lat: real("lat"),
    lng: real("lng"),
    cachedAt: text("cachedAt"),
  },
  (t) => [index("nearby_places_propertyId_idx").on(t.propertyId)]
);

// ── Inquiries ─────────────────────────────────────────────────────────────────
export const inquiries = sqliteTable(
  "inquiries",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    propertyId: text("propertyId"),
    name: text("name").notNull(),
    contact: text("contact").notNull(),
    contactType: text("contactType", { enum: ["line", "wechat", "whatsapp", "email", "phone"] }),
    preferredDate: text("preferredDate"),
    message: text("message"),
    status: text("status", { enum: ["new", "contacted", "booked", "declined"] }).default("new"),
    createdAt: text("createdAt"),
  },
  (t) => [
    index("inquiries_propertyId_idx").on(t.propertyId),
    index("inquiries_status_idx").on(t.status),
    index("inquiries_createdAt_idx").on(t.createdAt),
  ]
);

// ── Submissions (user-generated listing requests) ─────────────────────────────
export const submissions = sqliteTable(
  "submissions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ownerEmail: text("ownerEmail"),
    ownerPhone: text("ownerPhone"),
    dataJson: text("dataJson"),
    imagesJson: text("imagesJson"),
    status: text("status", { enum: ["pending", "approved", "rejected"] }).default("pending"),
    submittedAt: text("submittedAt"),
    reviewedAt: text("reviewedAt"),
  },
  (t) => [index("submissions_status_idx").on(t.status)]
);

// ── Search Logs ───────────────────────────────────────────────────────────────
export const searchLogs = sqliteTable(
  "search_logs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    query: text("query"),
    locale: text("locale"),
    resultCount: integer("resultCount"),
    filtersJson: text("filtersJson"),
    createdAt: text("createdAt"),
  },
  (t) => [
    index("search_logs_query_idx").on(t.query),
    index("search_logs_locale_idx").on(t.locale),
    index("search_logs_createdAt_idx").on(t.createdAt),
  ]
);

// ── Property Views ────────────────────────────────────────────────────────────
export const propertyViews = sqliteTable(
  "property_views",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    propertyId: text("propertyId"),
    locale: text("locale"),
    countryCode: text("countryCode"),
    referrer: text("referrer"),
    createdAt: text("createdAt"),
  },
  (t) => [
    index("property_views_propertyId_idx").on(t.propertyId),
    index("property_views_createdAt_idx").on(t.createdAt),
  ]
);

// ── Relations ─────────────────────────────────────────────────────────────────
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  properties: many(properties),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  owner: one(user, {
    fields: [properties.ownerId],
    references: [user.id],
  }),
  rentalPeriods: many(rentalPeriods),
  nearbyPlaces: many(nearbyPlaces),
}));

export const rentalPeriodsRelations = relations(rentalPeriods, ({ one }) => ({
  property: one(properties, {
    fields: [rentalPeriods.propertyId],
    references: [properties.id],
  }),
}));

export const nearbyPlacesRelations = relations(nearbyPlaces, ({ one }) => ({
  property: one(properties, {
    fields: [nearbyPlaces.propertyId],
    references: [properties.id],
  }),
}));
