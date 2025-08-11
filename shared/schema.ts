import { sql, relations } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  decimal, 
  boolean, 
  integer, 
  timestamp, 
  pgEnum 
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const accountTypeEnum = pgEnum("account_type", ["ASSET", "DEBT"]);
export const txnTypeEnum = pgEnum("txn_type", ["INCOME", "EXPENSE", "TRANSFER"]);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  name: text("name"),
  tz: text("tz").notNull().default("UTC"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});

// Accounts table
export const accounts = pgTable("accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: accountTypeEnum("type").notNull(),
  currency: text("currency").notNull().default("USD"),
  openingBalance: decimal("opening_balance", { precision: 12, scale: 2 }).notNull().default("0"),
  aprApy: decimal("apr_apy", { precision: 5, scale: 2 }),
  compound: text("compound"),
  rewardsEnabled: boolean("rewards_enabled").notNull().default(false),
  rewardsBalance: integer("rewards_balance"),
  creditLimit: decimal("credit_limit", { precision: 12, scale: 2 }),
  statementDay: integer("statement_day"),
  paymentDueDay: integer("payment_due_day"),
  archived: boolean("archived").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});

// Categories table
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  kind: txnTypeEnum("kind").notNull()
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accountId: varchar("account_id").notNull().references(() => accounts.id),
  toAccountId: varchar("to_account_id").references(() => accounts.id),
  type: txnTypeEnum("type").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  date: timestamp("date").notNull(),
  description: text("description"),
  categoryId: varchar("category_id").references(() => categories.id),
  cleared: boolean("cleared").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  recurringId: varchar("recurring_id")
});

// Recurring rules table
export const recurringRules = pgTable("recurring_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accountId: varchar("account_id").notNull().references(() => accounts.id),
  templateType: txnTypeEnum("template_type").notNull(),
  templateAmount: decimal("template_amount", { precision: 12, scale: 2 }).notNull(),
  templateDesc: text("template_desc"),
  templateCategoryId: varchar("template_category_id").references(() => categories.id),
  freq: text("freq").notNull(), // daily|weekly|biweekly|monthly|custom
  interval: integer("interval").notNull().default(1),
  byMonthDay: integer("by_month_day"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  timezone: text("timezone"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});

// Monthly statements table
export const monthlyStatements = pgTable("monthly_statements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accountId: varchar("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  statementBalance: decimal("statement_balance", { precision: 12, scale: 2 }).notNull(),
  interestCharged: decimal("interest_charged", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});

// Interest snapshots table
export const interestSnapshots = pgTable("interest_snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accountId: varchar("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  accrued: decimal("accrued", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  categories: many(categories),
  transactions: many(transactions),
  recurring: many(recurringRules),
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
  transactionsFrom: many(transactions, { relationName: "fromAccount" }),
  transactionsTo: many(transactions, { relationName: "toAccount" }),
  statements: many(monthlyStatements),
  interestSnaps: many(interestSnapshots),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, { fields: [categories.userId], references: [users.id] }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
  account: one(accounts, { 
    fields: [transactions.accountId], 
    references: [accounts.id],
    relationName: "fromAccount"
  }),
  toAccount: one(accounts, { 
    fields: [transactions.toAccountId], 
    references: [accounts.id],
    relationName: "toAccount"
  }),
  category: one(categories, { fields: [transactions.categoryId], references: [categories.id] }),
}));

export const recurringRulesRelations = relations(recurringRules, ({ one }) => ({
  user: one(users, { fields: [recurringRules.userId], references: [users.id] }),
  account: one(accounts, { fields: [recurringRules.accountId], references: [accounts.id] }),
}));

export const monthlyStatementsRelations = relations(monthlyStatements, ({ one }) => ({
  account: one(accounts, { fields: [monthlyStatements.accountId], references: [accounts.id] }),
}));

export const interestSnapshotsRelations = relations(interestSnapshots, ({ one }) => ({
  account: one(accounts, { fields: [interestSnapshots.accountId], references: [accounts.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertAccountSchema = createInsertSchema(accounts).omit({
  id: true,
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertRecurringRuleSchema = createInsertSchema(recurringRules).omit({
  id: true,
  createdAt: true,
});

export const insertMonthlyStatementSchema = createInsertSchema(monthlyStatements).omit({
  id: true,
  createdAt: true,
});

export const insertInterestSnapshotSchema = createInsertSchema(interestSnapshots).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Account = typeof accounts.$inferSelect;
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type RecurringRule = typeof recurringRules.$inferSelect;
export type InsertRecurringRule = z.infer<typeof insertRecurringRuleSchema>;
export type MonthlyStatement = typeof monthlyStatements.$inferSelect;
export type InsertMonthlyStatement = z.infer<typeof insertMonthlyStatementSchema>;
export type InterestSnapshot = typeof interestSnapshots.$inferSelect;
export type InsertInterestSnapshot = z.infer<typeof insertInterestSnapshotSchema>;
