import { 
  users, 
  accounts,
  categories,
  transactions,
  recurringRules,
  monthlyStatements,
  interestSnapshots,
  dailyBalances,
  type User, 
  type InsertUser,
  type Account,
  type InsertAccount,
  type Category,
  type InsertCategory,
  type Transaction,
  type InsertTransaction,
  type RecurringRule,
  type InsertRecurringRule,
  type MonthlyStatement,
  type InsertMonthlyStatement,
  type InterestSnapshot,
  type InsertInterestSnapshot,
  type DailyBalance,
  type InsertDailyBalance
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, asc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Account methods
  getAccountsByUser(userId: string): Promise<Account[]>;
  getAccount(id: string): Promise<Account | undefined>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccount(id: string, account: Partial<InsertAccount>): Promise<Account>;
  archiveAccount(id: string): Promise<void>;

  // Category methods
  getCategoriesByUser(userId: string): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;

  // Transaction methods
  getTransactionsByUser(userId: string, filters?: {
    accountId?: string;
    type?: string;
    categoryId?: string;
    recurringId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<Transaction[]>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, transaction: Partial<InsertTransaction>): Promise<Transaction>;
  deleteTransaction(id: string): Promise<void>;

  // Recurring rules methods
  getRecurringRulesByUser(userId: string): Promise<RecurringRule[]>;
  getRecurringRule(id: string): Promise<RecurringRule | undefined>;
  createRecurringRule(rule: InsertRecurringRule): Promise<RecurringRule>;
  updateRecurringRule(id: string, rule: Partial<InsertRecurringRule>): Promise<RecurringRule>;
  deleteRecurringRule(id: string): Promise<void>;

  // Monthly statements methods
  getStatementsByAccount(accountId: string): Promise<MonthlyStatement[]>;
  createStatement(statement: InsertMonthlyStatement): Promise<MonthlyStatement>;
  updateStatement(id: string, statement: Partial<InsertMonthlyStatement>): Promise<MonthlyStatement>;

  // Interest snapshots methods
  getInterestSnapshots(accountId: string, date?: Date): Promise<InterestSnapshot[]>;
  createInterestSnapshot(snapshot: InsertInterestSnapshot): Promise<InterestSnapshot>;

  // Daily balance methods
  getDailyBalance(accountId: string, date: Date): Promise<DailyBalance | undefined>;
  getDailyBalancesByAccount(accountId: string, startDate?: Date, endDate?: Date): Promise<DailyBalance[]>;
  createDailyBalance(balance: InsertDailyBalance): Promise<DailyBalance>;
  updateDailyBalance(accountId: string, date: Date, balance: string): Promise<DailyBalance>;
  upsertDailyBalance(accountId: string, date: Date, balance: string): Promise<DailyBalance>;
  calculateDailyBalance(accountId: string, date: Date): Promise<string>;
  updateDailyBalancesForAccount(accountId: string, startDate: Date, endDate: Date): Promise<void>;

  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Account methods
  async getAccountsByUser(userId: string): Promise<Account[]> {
    return await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.userId, userId), eq(accounts.archived, false)))
      .orderBy(asc(accounts.name));
  }

  async getAccount(id: string): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.id, id));
    return account || undefined;
  }

  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const [account] = await db
      .insert(accounts)
      .values(insertAccount)
      .returning();
    return account;
  }

  async updateAccount(id: string, updateAccount: Partial<InsertAccount>): Promise<Account> {
    const [account] = await db
      .update(accounts)
      .set(updateAccount)
      .where(eq(accounts.id, id))
      .returning();
    return account;
  }

  async archiveAccount(id: string): Promise<void> {
    await db
      .update(accounts)
      .set({ archived: true })
      .where(eq(accounts.id, id));
  }

  // Category methods
  async getCategoriesByUser(userId: string): Promise<Category[]> {
    const existingCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.userId, userId))
      .orderBy(asc(categories.kind), asc(categories.name));
    
    // Create default categories if none exist
    if (existingCategories.length === 0) {
      await this.createDefaultCategories(userId);
      return await db
        .select()
        .from(categories)
        .where(eq(categories.userId, userId))
        .orderBy(asc(categories.kind), asc(categories.name));
    }
    
    return existingCategories;
  }

  private async createDefaultCategories(userId: string): Promise<void> {
    const defaultCategories = [
      { name: "Groceries", kind: "EXPENSE" as const },
      { name: "Dining Out", kind: "EXPENSE" as const },
      { name: "Gas & Fuel", kind: "EXPENSE" as const },
      { name: "Shopping", kind: "EXPENSE" as const },
      { name: "Entertainment", kind: "EXPENSE" as const },
      { name: "Utilities", kind: "EXPENSE" as const },
      { name: "Healthcare", kind: "EXPENSE" as const },
      { name: "Transportation", kind: "EXPENSE" as const },
      { name: "Insurance", kind: "EXPENSE" as const },
      { name: "Other Expenses", kind: "EXPENSE" as const },
      { name: "Salary", kind: "INCOME" as const },
      { name: "Freelance", kind: "INCOME" as const },
      { name: "Investment Income", kind: "INCOME" as const },
      { name: "Interest", kind: "INCOME" as const },
      { name: "Other Income", kind: "INCOME" as const },
    ];

    for (const category of defaultCategories) {
      await this.createCategory({
        userId,
        name: category.name,
        kind: category.kind,
      });
    }
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    return category;
  }

  async updateCategory(id: string, updateCategory: Partial<InsertCategory>): Promise<Category> {
    const [category] = await db
      .update(categories)
      .set(updateCategory)
      .where(eq(categories.id, id))
      .returning();
    return category;
  }

  async deleteCategory(id: string): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Transaction methods
  async getTransactionsByUser(userId: string, filters?: {
    accountId?: string;
    type?: string;
    categoryId?: string;
    recurringId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<Transaction[]> {
    let whereConditions = [eq(transactions.userId, userId)];

    if (filters?.accountId) {
      whereConditions.push(eq(transactions.accountId, filters.accountId));
    }
    
    if (filters?.type) {
      whereConditions.push(eq(transactions.type, filters.type as any));
    }
    
    if (filters?.categoryId) {
      whereConditions.push(eq(transactions.categoryId, filters.categoryId));
    }
    
    if (filters?.recurringId) {
      whereConditions.push(eq(transactions.recurringId, filters.recurringId));
    }
    
    if (filters?.startDate) {
      whereConditions.push(gte(transactions.date, filters.startDate));
    }
    
    if (filters?.endDate) {
      whereConditions.push(lte(transactions.date, filters.endDate));
    }

    let query = db
      .select()
      .from(transactions)
      .where(and(...whereConditions))
      .orderBy(desc(transactions.date), desc(transactions.createdAt));
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    return await query;
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction || undefined;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }

  async updateTransaction(id: string, updateTransaction: Partial<InsertTransaction>): Promise<Transaction> {
    const [transaction] = await db
      .update(transactions)
      .set(updateTransaction)
      .where(eq(transactions.id, id))
      .returning();
    return transaction;
  }

  async deleteTransaction(id: string): Promise<void> {
    await db.delete(transactions).where(eq(transactions.id, id));
  }

  // Recurring rules methods
  async getRecurringRulesByUser(userId: string): Promise<RecurringRule[]> {
    return await db
      .select()
      .from(recurringRules)
      .where(eq(recurringRules.userId, userId))
      .orderBy(desc(recurringRules.createdAt));
  }

  async getRecurringRule(id: string): Promise<RecurringRule | undefined> {
    const [rule] = await db.select().from(recurringRules).where(eq(recurringRules.id, id));
    return rule || undefined;
  }

  async createRecurringRule(insertRule: InsertRecurringRule): Promise<RecurringRule> {
    const [rule] = await db
      .insert(recurringRules)
      .values(insertRule)
      .returning();
    return rule;
  }

  async updateRecurringRule(id: string, updateRule: Partial<InsertRecurringRule>): Promise<RecurringRule> {
    const [rule] = await db
      .update(recurringRules)
      .set(updateRule)
      .where(eq(recurringRules.id, id))
      .returning();
    return rule;
  }

  async deleteRecurringRule(id: string): Promise<void> {
    await db.delete(recurringRules).where(eq(recurringRules.id, id));
  }

  // Monthly statements methods
  async getStatementsByAccount(accountId: string): Promise<MonthlyStatement[]> {
    return await db
      .select()
      .from(monthlyStatements)
      .where(eq(monthlyStatements.accountId, accountId))
      .orderBy(desc(monthlyStatements.periodStart));
  }

  async createStatement(insertStatement: InsertMonthlyStatement): Promise<MonthlyStatement> {
    const [statement] = await db
      .insert(monthlyStatements)
      .values(insertStatement)
      .returning();
    return statement;
  }

  async updateStatement(id: string, updateStatement: Partial<InsertMonthlyStatement>): Promise<MonthlyStatement> {
    const [statement] = await db
      .update(monthlyStatements)
      .set(updateStatement)
      .where(eq(monthlyStatements.id, id))
      .returning();
    return statement;
  }

  // Interest snapshots methods
  async getInterestSnapshots(accountId: string, date?: Date): Promise<InterestSnapshot[]> {
    if (date) {
      return await db
        .select()
        .from(interestSnapshots)
        .where(and(
          eq(interestSnapshots.accountId, accountId),
          eq(interestSnapshots.date, date)
        ))
        .orderBy(desc(interestSnapshots.date));
    }
    
    return await db
      .select()
      .from(interestSnapshots)
      .where(eq(interestSnapshots.accountId, accountId))
      .orderBy(desc(interestSnapshots.date));
  }

  async createInterestSnapshot(insertSnapshot: InsertInterestSnapshot): Promise<InterestSnapshot> {
    const [snapshot] = await db
      .insert(interestSnapshots)
      .values(insertSnapshot)
      .returning();
    return snapshot;
  }

  // Daily balance methods
  async getDailyBalance(accountId: string, date: Date): Promise<DailyBalance | undefined> {
    const [balance] = await db
      .select()
      .from(dailyBalances)
      .where(and(
        eq(dailyBalances.accountId, accountId),
        eq(dailyBalances.date, date)
      ));
    return balance || undefined;
  }

  async getDailyBalancesByAccount(accountId: string, startDate?: Date, endDate?: Date): Promise<DailyBalance[]> {
    let whereConditions = [eq(dailyBalances.accountId, accountId)];
    
    if (startDate) {
      whereConditions.push(gte(dailyBalances.date, startDate));
    }
    
    if (endDate) {
      whereConditions.push(lte(dailyBalances.date, endDate));
    }

    return await db
      .select()
      .from(dailyBalances)
      .where(and(...whereConditions))
      .orderBy(asc(dailyBalances.date));
  }

  async createDailyBalance(insertBalance: InsertDailyBalance): Promise<DailyBalance> {
    const [balance] = await db
      .insert(dailyBalances)
      .values(insertBalance)
      .returning();
    return balance;
  }

  async updateDailyBalance(accountId: string, date: Date, balance: string): Promise<DailyBalance> {
    const [updated] = await db
      .update(dailyBalances)
      .set({ balance })
      .where(and(
        eq(dailyBalances.accountId, accountId),
        eq(dailyBalances.date, date)
      ))
      .returning();
    return updated;
  }

  async upsertDailyBalance(accountId: string, date: Date, balance: string): Promise<DailyBalance> {
    const existing = await this.getDailyBalance(accountId, date);
    
    if (existing) {
      return await this.updateDailyBalance(accountId, date, balance);
    } else {
      return await this.createDailyBalance({
        accountId,
        date,
        balance
      });
    }
  }

  // Calculate daily balance for a specific account and date
  async calculateDailyBalance(accountId: string, date: Date): Promise<string> {
    // Get the account to get opening balance
    const account = await this.getAccount(accountId);
    if (!account) {
      throw new Error("Account not found");
    }

    // Get all transactions up to and including this date
    const transactions = await this.getTransactionsByUser(account.userId, {
      accountId,
      endDate: date
    });

    // Start with opening balance
    let balance = parseFloat(account.openingBalance);

    // Apply all transactions
    for (const transaction of transactions) {
      const amount = parseFloat(transaction.amount);
      
      if (transaction.type === 'INCOME') {
        balance += amount;
      } else if (transaction.type === 'EXPENSE') {
        if (account.type === 'ASSET') {
          balance -= amount; // For asset accounts, expenses reduce balance
        } else {
          balance += amount; // For debt accounts, expenses increase balance (more debt)
        }
      } else if (transaction.type === 'TRANSFER') {
        if (transaction.accountId === accountId) {
          // Money leaving this account
          balance -= amount;
        }
        if (transaction.toAccountId === accountId) {
          // Money coming into this account
          balance += amount;
        }
      }
    }

    return balance.toFixed(2);
  }

  // Update daily balances for an account for a date range
  async updateDailyBalancesForAccount(accountId: string, startDate: Date, endDate: Date): Promise<void> {
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const balance = await this.calculateDailyBalance(accountId, currentDate);
      await this.upsertDailyBalance(accountId, currentDate, balance);
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }
}

export const storage = new DatabaseStorage();
