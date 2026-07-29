import {
  pgTable,
  pgEnum,
  uuid,
  text,
  boolean,
  timestamp,
  numeric,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const appRoleEnum = pgEnum("app_role", [
  "customer",
  "staff",
  "admin",
]);

export const accountStatusEnum = pgEnum("account_status", [
  "active",
  "frozen",
  "closed",
  "pending",
]);

export const accountTypeEnum = pgEnum("account_type", [
  "savings",
  "current",
  "business",
  "investment",
]);

export const cardStatusEnum = pgEnum("card_status", [
  "active",
  "frozen",
  "blocked",
  "pending",
]);

export const cardTypeEnum = pgEnum("card_type", ["debit", "virtual"]);

export const txTypeEnum = pgEnum("tx_type", ["credit", "debit"]);

export const txStatusEnum = pgEnum("tx_status", [
  "completed",
  "pending",
  "failed",
]);

export const loanStatusEnum = pgEnum("loan_status", [
  "pending",
  "approved",
  "active",
  "rejected",
  "closed",
]);

export const loanTypeEnum = pgEnum("loan_type", [
  "personal",
  "home",
  "auto",
  "education",
  "business",
]);

export const investmentStatusEnum = pgEnum("investment_status", [
  "active",
  "matured",
  "withdrawn",
]);

export const investmentTypeEnum = pgEnum("investment_type", [
  "mutualFund",
  "fixedDeposit",
  "stocks",
  "bonds",
  "crypto",
]);

export const kycStatusEnum = pgEnum("kyc_status", [
  "pending",
  "verified",
  "rejected",
]);

export const kycDocTypeEnum = pgEnum("kyc_doc_type", [
  "passport",
  "nationalId",
  "driverLicense",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "general",
  "transaction",
  "security",
  "loan",
  "kyc",
]);

export const ticketPriorityEnum = pgEnum("ticket_priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);

export const ticketStatusEnum = pgEnum("ticket_status", [
  "open",
  "inProgress",
  "resolved",
  "closed",
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: appRoleEnum("role").default("customer"),
  phone: text("phone"),
  address: text("address"),
  avatarUrl: text("avatar_url"),
  dateOfBirth: text("date_of_birth"),
  isActive: boolean("is_active").default(true),
  passwordHash: text("password_hash"),
  pinHash: text("pin_hash"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const passwordResetTokensTable = pgTable("password_reset_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.id),
  token: text("token").unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const accountsTable = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => usersTable.id)
    .notNull(),
  accountNumber: text("account_number").unique().notNull(),
  type: accountTypeEnum("type").notNull(),
  status: accountStatusEnum("status").default("active"),
  balance: numeric("balance", { precision: 15, scale: 2 }).default("0"),
  currency: text("currency").default("USD"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const transactionsTable = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id")
    .references(() => accountsTable.id)
    .notNull(),
  type: txTypeEnum("type").notNull(),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  status: txStatusEnum("status").default("pending"),
  category: text("category"),
  description: text("description"),
  recipientName: text("recipient_name"),
  recipientAccount: text("recipient_account"),
  reference: text("reference"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cardsTable = pgTable("cards", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => usersTable.id)
    .notNull(),
  accountId: uuid("account_id")
    .references(() => accountsTable.id)
    .notNull(),
  type: cardTypeEnum("type").notNull(),
  status: cardStatusEnum("status").default("pending"),
  cardholderName: text("cardholder_name").notNull(),
  last4: text("last_4").notNull(),
  expiryMonth: integer("expiry_month").notNull(),
  expiryYear: integer("expiry_year").notNull(),
  network: text("network"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const loansTable = pgTable("loans", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => usersTable.id)
    .notNull(),
  type: loanTypeEnum("type").notNull(),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  interestRate: numeric("interest_rate", { precision: 5, scale: 2 }).notNull(),
  tenureMonths: integer("tenure_months").notNull(),
  emiAmount: numeric("emi_amount", { precision: 15, scale: 2 }),
  outstandingAmount: numeric("outstanding_amount", { precision: 15, scale: 2 }),
  purpose: text("purpose"),
  status: loanStatusEnum("status").default("pending"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const investmentsTable = pgTable("investments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => usersTable.id)
    .notNull(),
  type: investmentTypeEnum("type").notNull(),
  name: text("name"),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  currentValue: numeric("current_value", { precision: 15, scale: 2 }),
  returnRate: numeric("return_rate", { precision: 5, scale: 2 }),
  status: investmentStatusEnum("status").default("active"),
  maturityDate: text("maturity_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const kycRecordsTable = pgTable("kyc_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => usersTable.id)
    .unique()
    .notNull(),
  fullName: text("full_name").notNull(),
  documentType: kycDocTypeEnum("document_type").notNull(),
  documentNumber: text("document_number").notNull(),
  documentFrontImage: text("document_front_image"),
  documentBackImage: text("document_back_image"),
  dateOfBirth: text("date_of_birth"),
  nationality: text("nationality"),
  address: text("address"),
  status: kycStatusEnum("status").default("pending"),
  adminNotes: text("admin_notes"),
  rejectionReason: text("rejection_reason"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notificationsTable = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => usersTable.id)
    .notNull(),
  type: notificationTypeEnum("type").default("general"),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const supportTicketsTable = pgTable("support_tickets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => usersTable.id)
    .notNull(),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  priority: ticketPriorityEnum("priority").default("low"),
  status: ticketStatusEnum("status").default("open"),
  staffNotes: text("staff_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const beneficiariesTable = pgTable("beneficiaries", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => usersTable.id)
    .notNull(),
  name: text("name").notNull(),
  accountNumber: text("account_number").notNull(),
  bankName: text("bank_name"),
  email: text("email"),
  ifscCode: text("ifsc_code"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const auditLogsTable = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.id),
  action: text("action").notNull(),
  entityType: text("entity_type"),
  entityId: text("entity_id"),
  ipAddress: text("ip_address"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type User = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;

export type PasswordResetToken = typeof passwordResetTokensTable.$inferSelect;
export type InsertPasswordResetToken =
  typeof passwordResetTokensTable.$inferInsert;

export type Account = typeof accountsTable.$inferSelect;
export type InsertAccount = typeof accountsTable.$inferInsert;

export type Transaction = typeof transactionsTable.$inferSelect;
export type InsertTransaction = typeof transactionsTable.$inferInsert;

export type Card = typeof cardsTable.$inferSelect;
export type InsertCard = typeof cardsTable.$inferInsert;

export type Loan = typeof loansTable.$inferSelect;
export type InsertLoan = typeof loansTable.$inferInsert;

export type Investment = typeof investmentsTable.$inferSelect;
export type InsertInvestment = typeof investmentsTable.$inferInsert;

export type KycRecord = typeof kycRecordsTable.$inferSelect;
export type InsertKycRecord = typeof kycRecordsTable.$inferInsert;

export type Notification = typeof notificationsTable.$inferSelect;
export type InsertNotification = typeof notificationsTable.$inferInsert;

export type SupportTicket = typeof supportTicketsTable.$inferSelect;
export type InsertSupportTicket = typeof supportTicketsTable.$inferInsert;

export type Beneficiary = typeof beneficiariesTable.$inferSelect;
export type InsertBeneficiary = typeof beneficiariesTable.$inferInsert;

export type AuditLog = typeof auditLogsTable.$inferSelect;
export type InsertAuditLog = typeof auditLogsTable.$inferInsert;
