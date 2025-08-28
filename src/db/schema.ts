import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  time,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

//Users
export const usersTable = pgTable("users", {
  //Cliente
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  image: text("image"),
  emailVerified: boolean("email_verified").notNull(),
  phone: text("phone_number").notNull().unique(),
  docNumber: text("doc_number").unique(),
  subscriptionStatus: text("subscription_status"),
  role: text("role").notNull().default("administrator"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

//Table to store customer subscription data
export const usersSubscriptionTable = pgTable("users_subscription", {
  id: text("id").primaryKey(),
  docNumber: text("doc_number").unique(),
  phone: text("phone_number").notNull().unique(),
  email: text("email").notNull().unique(),
  //Plano
  planId: text("plan_id"),
  plan: text("plan"),
  //Assinatura
  subscriptionStatus: text("subscription_status"),
  subscriptionId: text("subscription_id"),
  //Pagamento
  paymentMethod: text("payment_method"),
  paidAt: timestamp("paid_at"),
  //Cancelamento
  canceledAt: timestamp("canceled_at"),
  //Outros de Cliente
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

//Table to store sessions
export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});

//table to store accounts
export const accountsTable = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

//Table to store verifications
export const verificationsTable = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

//Users table relationships
export const usersTableRelations = relations(usersTable, ({ many }) => ({
  usersToEnterprises: many(usersToEnterprisesTable),
  ownedEnterprises: many(enterprisesTable),
}));

//Mid Table for relation N-N Users & Enterprises
export const usersToEnterprisesTable = pgTable("users_to_enterprises", {
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  enterpriseId: uuid("enterprise_id")
    .notNull()
    .references(() => enterprisesTable.id, { onDelete: "cascade" }),
  createdAT: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

//Mid table "usersToEnterprisesTable" relations table
export const usersToEnterprisesTableRelations = relations(
  usersToEnterprisesTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [usersToEnterprisesTable.userId],
      references: [usersTable.id],
    }),
    enterprise: one(enterprisesTable, {
      fields: [usersToEnterprisesTable.enterpriseId],
      references: [enterprisesTable.id],
    }),
  }),
);

//Enteprises table
export const enterprisesTable = pgTable("enterprises", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  specialty: text("specialty").notNull(),
  cep: text("cep").notNull(),
  address: text("address").notNull(),
  number: text("number").notNull(),
  complement: text("complement"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  phoneNumber: text("phone_number").notNull(),
  instagramURL: text("instagram_url").notNull(),
  register: text("register").notNull(),
  slug: text("slug").notNull().unique(),
  avatarImageURL: text("avatar_image_url"),
  confirmation: text("confirmation").notNull().default("manual"),
  interval: text("interval").default("30"),
  ownerId: text("owner_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  createdAT: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

//Enteprises tables relationships whit professionals, clients, appointments and users
export const enterpriseTablesRelations = relations(
  enterprisesTable,
  ({ many, one }) => ({
    professionals: many(professionalsTable),
    clients: many(clientsTable),
    appointments: many(appointmentsTable),
    usersToEnterprises: many(usersToEnterprisesTable),
    owner: one(usersTable, {
      fields: [enterprisesTable.ownerId],
      references: [usersTable.id],
    }),
  }),
);

//Professionals tables
export const professionalsTable = pgTable("professionals", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  specialty: text("specialty").notNull(),
  avatarImageURL: text("avatar_image_url"),
  phoneNumber: text("phone_number").notNull(),
  instagramURL: text("instagram_url").notNull(),
  availableFromWeekDay: integer("available_from_week_day").notNull(),
  availableToWeekDay: integer("available_to_week_day").notNull(),
  availableFromTime: time("available_from_time").notNull(),
  availableToTime: time("available_to_time").notNull(),
  status: text("status").notNull().default("active"),
  createdAT: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
  //Relationships
  enterpriseId: uuid("enterprise_id")
    .notNull()
    .references(() => enterprisesTable.id, { onDelete: "cascade" }),
  userId: uuid("user_id"),
});

//Professionals tables relationships whit relations whit enterprises and appointments
export const professionalsTableRelations = relations(
  professionalsTable,
  ({ many, one }) => ({
    enterprise: one(enterprisesTable, {
      fields: [professionalsTable.enterpriseId],
      references: [enterprisesTable.id],
    }),
    appointmentsTable: many(appointmentsTable),
    professionalsToServices: many(professionalsToServicesTable),
  }),
);

//Mid Table for relation N-N professionals & services
export const professionalsToServicesTable = pgTable(
  "professionals_to_services",
  {
    professionalId: uuid("professional_id")
      .notNull()
      .references(() => professionalsTable.id, { onDelete: "cascade" }),
    serviceId: uuid("service_id")
      .notNull()
      .references(() => servicesTable.id, { onDelete: "cascade" }),
    createdAT: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
);

//Mid table "professionalsToServicesTable" relations table
export const professionalsToServicesTableRelations = relations(
  professionalsToServicesTable,
  ({ one }) => ({
    professional: one(professionalsTable, {
      fields: [professionalsToServicesTable.professionalId],
      references: [professionalsTable.id],
    }),
    service: one(servicesTable, {
      fields: [professionalsToServicesTable.serviceId],
      references: [servicesTable.id],
    }),
  }),
);

//Catalog table
export const servicesTable = pgTable("services", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  durationInMinutes: integer("duration_in_minutes").notNull(),
  servicePriceInCents: integer("service_price_in_cents").notNull(),
  status: text("status").notNull().default("active"),
  createdAT: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
  enterpriseId: uuid("enterprise_id")
    .notNull()
    .references(() => enterprisesTable.id, { onDelete: "cascade" }),
});

//Services table relationships
export const servicesTableRelations = relations(
  servicesTable,
  ({ many, one }) => ({
    enterprise: one(enterprisesTable, {
      fields: [servicesTable.enterpriseId],
      references: [enterprisesTable.id],
    }),
    professionalsToServices: many(professionalsToServicesTable),
  }),
);

//Clients table
export const clientsTable = pgTable("clients", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  phoneNumber: text("phone_number").notNull().unique(),
  termsAccepted: boolean("terms_accepted").notNull().default(false),
  termsAcceptedAt: timestamp("terms_accepted_at"),
  termsVersionAccepted: text("terms_version_accepted"),
  privacyAccepted: boolean("privacy_accepted").notNull().default(false),
  privacyAcceptedAt: timestamp("privacy_accepted_at"),
  privacyVersionAccepted: text("privacy_version_accepted"),
  createdAT: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
  //Relationships
  enterpriseId: uuid("enterprise_id")
    .notNull()
    .references(() => enterprisesTable.id, { onDelete: "cascade" }),
  userId: uuid("user_id"),
});

//Clients tables relationships whit relations whit enterprises
export const clientsTableRelations = relations(clientsTable, ({ one }) => ({
  enterprise: one(enterprisesTable, {
    fields: [clientsTable.enterpriseId],
    references: [enterprisesTable.id],
  }),
}));

//Client verifications table
export const clientSessionsTable = pgTable("client_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  token: text("token").notNull(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clientsTable.id, { onDelete: "cascade" }),
  enterpriseId: uuid("enterprise_id")
    .notNull()
    .references(() => enterprisesTable.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

//Client sessions table relationships
export const clientSessionsTableRelations = relations(
  clientSessionsTable,
  ({ one }) => ({
    client: one(clientsTable, {
      fields: [clientSessionsTable.clientId],
      references: [clientsTable.id],
    }),
    enterprise: one(enterprisesTable, {
      fields: [clientSessionsTable.enterpriseId],
      references: [enterprisesTable.id],
    }),
  }),
);

//Appointments table
export const appointmentsTable = pgTable("appointments", {
  id: uuid("id").defaultRandom().primaryKey(),
  date: timestamp("date").notNull(),
  time: time("time"),
  status: text("status").notNull().default("scheduled"),
  identifier: text("identifier"),
  startTime: time("start_time"),
  endTime: time("end_time"),
  appointmentPriceInCents: integer("appointment_price_in_cents").notNull(),
  createdAT: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
  //Relationships
  enterpriseId: uuid("enterprise_id")
    .notNull()
    .references(() => enterprisesTable.id, { onDelete: "cascade" }),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clientsTable.id, { onDelete: "cascade" }),
  professionalId: uuid("professional_id")
    .notNull()
    .references(() => professionalsTable.id, { onDelete: "cascade" }),
  serviceId: uuid("service_id")
    .notNull()
    .references(() => servicesTable.id, { onDelete: "cascade" }),
});

//Appointments relations whit enterprise, client and professional
export const appointmentsTableRelations = relations(
  appointmentsTable,
  ({ one }) => ({
    enterprise: one(enterprisesTable, {
      fields: [appointmentsTable.enterpriseId],
      references: [enterprisesTable.id],
    }),
    client: one(clientsTable, {
      fields: [appointmentsTable.clientId],
      references: [clientsTable.id],
    }),
    professional: one(professionalsTable, {
      fields: [appointmentsTable.professionalId],
      references: [professionalsTable.id],
    }),
    service: one(servicesTable, {
      fields: [appointmentsTable.serviceId],
      references: [servicesTable.id],
    }),
  }),
);

//Products table
export const productsTable = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  brand: text("brand").notNull(),
  quantity: integer("quantity").notNull(),
  productPriceInCents: integer("product_price_in_cents").notNull(),
  is_consumable: boolean("is_consumable").notNull().default(true),
  quantity_in_stock: integer("quantity_in_stock").default(0),
  stock_status: text("stock_status").default("Em estoque"),
  createdAT: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
  //Relationships
  enterpriseId: uuid("enterprise_id")
    .notNull()
    .references(() => enterprisesTable.id, { onDelete: "cascade" }),
});

//Products tables relationships whit relations whit enterprises
export const prductsTableRelations = relations(productsTable, ({ one }) => ({
  enterprise: one(enterprisesTable, {
    fields: [productsTable.enterpriseId],
    references: [enterprisesTable.id],
  }),
}));

export const stockMovements = pgTable("stock_movements", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .notNull()
    .references(() => productsTable.id, { onDelete: "cascade" }),
  enterpriseId: uuid("enterprise_id")
    .notNull()
    .references(() => enterprisesTable.id, { onDelete: "cascade" }),
  movementType: text("movement_type", { enum: ["entry", "exit"] }).notNull(),
  quantity: integer("quantity").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Table to store client verification codes (WhatsApp)
export const verificationCodesTable = pgTable("verification_codes", {
  id: uuid("id").defaultRandom().primaryKey(),
  phoneNumber: text("phone_number").notNull(),
  code: text("code").notNull(),
  clientData: text("client_data"), // JSON string
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

//Table to store clients terms
export const ClientstermsTable = pgTable("clients_terms", {
  id: text("id").primaryKey(),
  version: text("version").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(), // "terms_of_service" | "privacy_policy"
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

//Table to store user terms
export const UserstermsTable = pgTable("users_terms", {
  id: text("id").primaryKey(),
  version: text("version").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(), // "terms_of_service" | "privacy_policy"
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
