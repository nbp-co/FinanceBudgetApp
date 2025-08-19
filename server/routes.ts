import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { 
  insertAccountSchema,
  insertCategorySchema,
  insertTransactionSchema,
  insertRecurringRuleSchema,
  insertMonthlyStatementSchema 
} from "@shared/schema";
import { addMonths, startOfMonth, endOfMonth, addDays, addWeeks } from "date-fns";

// Helper function to generate future recurring transactions
function generateFutureTransactions(baseTransaction: any, recurringRule: any, monthsAhead: number = 12) {
  const futureTransactions = [];
  const startDate = new Date(baseTransaction.date);
  let currentDate = new Date(startDate);
  
  // Generate transactions for the specified number of months
  const endDate = addMonths(startDate, monthsAhead);
  
  while (currentDate < endDate) {
    // Calculate next occurrence based on frequency
    switch (recurringRule.freq) {
      case 'daily':
        currentDate = addDays(currentDate, recurringRule.interval || 1);
        break;
      case 'weekly':
        currentDate = addWeeks(currentDate, recurringRule.interval || 1);
        break;
      case 'biweekly':
        currentDate = addWeeks(currentDate, 2 * (recurringRule.interval || 1));
        break;
      case 'monthly':
      default:
        currentDate = addMonths(currentDate, recurringRule.interval || 1);
        break;
    }
    
    // Don't include the original transaction date
    if (currentDate.getTime() !== startDate.getTime() && currentDate < endDate) {
      futureTransactions.push({
        ...baseTransaction,
        date: new Date(currentDate),
        id: undefined, // Let the database generate new IDs
        createdAt: undefined
      });
    }
  }
  
  return futureTransactions;
}

function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated() || !req.user) {
    return res.sendStatus(401);
  }
  next();
}

function getUserId(req: any): string {
  return req.user.id;
}

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Accounts routes
  app.get("/api/accounts", requireAuth, async (req, res) => {
    try {
      console.log("Fetching accounts for user:", getUserId(req));
      const accounts = await storage.getAccountsByUser(getUserId(req));
      console.log("Found accounts:", accounts);
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      res.status(500).json({ message: "Failed to fetch accounts", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.post("/api/accounts", requireAuth, async (req, res) => {
    try {
      const accountData = insertAccountSchema.parse({
        ...req.body,
        userId: getUserId(req)
      });
      const account = await storage.createAccount(accountData);
      res.status(201).json(account);
    } catch (error) {
      res.status(400).json({ message: "Invalid account data" });
    }
  });

  app.patch("/api/accounts/:id", requireAuth, async (req, res) => {
    try {
      const account = await storage.getAccount(req.params.id);
      if (!account || account.userId !== getUserId(req)) {
        return res.sendStatus(404);
      }
      
      const updatedAccount = await storage.updateAccount(req.params.id, req.body);
      res.json(updatedAccount);
    } catch (error) {
      res.status(400).json({ message: "Failed to update account" });
    }
  });

  app.delete("/api/accounts/:id", requireAuth, async (req, res) => {
    try {
      const account = await storage.getAccount(req.params.id);
      if (!account || account.userId !== getUserId(req)) {
        return res.sendStatus(404);
      }
      
      await storage.archiveAccount(req.params.id);
      res.sendStatus(200);
    } catch (error) {
      res.status(500).json({ message: "Failed to archive account" });
    }
  });

  // Categories routes
  app.get("/api/categories", requireAuth, async (req, res) => {
    try {
      console.log("Fetching categories for user:", getUserId(req));
      const categories = await storage.getCategoriesByUser(getUserId(req));
      console.log("Found categories:", categories);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.post("/api/categories", requireAuth, async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse({
        ...req.body,
        userId: getUserId(req)
      });
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ message: "Invalid category data" });
    }
  });

  app.patch("/api/categories/:id", requireAuth, async (req, res) => {
    try {
      const category = await storage.getCategory(req.params.id);
      if (!category || category.userId !== getUserId(req)) {
        return res.sendStatus(404);
      }
      
      const updatedCategory = await storage.updateCategory(req.params.id, req.body);
      res.json(updatedCategory);
    } catch (error) {
      res.status(400).json({ message: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:id", requireAuth, async (req, res) => {
    try {
      const category = await storage.getCategory(req.params.id);
      if (!category || category.userId !== getUserId(req)) {
        return res.sendStatus(404);
      }
      
      await storage.deleteCategory(req.params.id);
      res.sendStatus(200);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Transactions routes
  app.get("/api/transactions", requireAuth, async (req, res) => {
    try {
      const { 
        accountId, 
        type, 
        categoryId, 
        startDate, 
        endDate, 
        limit = "50", 
        offset = "0" 
      } = req.query;

      const filters: any = {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      };

      if (accountId) filters.accountId = accountId as string;
      if (type) filters.type = type as string;
      if (categoryId) filters.categoryId = categoryId as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const transactions = await storage.getTransactionsByUser(getUserId(req), filters);
      console.log("Found transactions:", transactions);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.post("/api/transactions", requireAuth, async (req, res) => {
    try {
      console.log("Creating transaction with data:", req.body);
      const { isRecurring, frequency, interval, ...transactionBody } = req.body;
      
      const transactionData = insertTransactionSchema.parse({
        ...transactionBody,
        userId: getUserId(req),
        date: new Date(transactionBody.date)
      });
      console.log("Parsed transaction data:", transactionData);
      
      // Create the initial transaction
      const transaction = await storage.createTransaction(transactionData);
      
      // If this is a recurring transaction, create the recurring rule and future transactions
      if (isRecurring) {
        console.log("Creating recurring rule for transaction");
        
        const recurringRuleData = insertRecurringRuleSchema.parse({
          userId: getUserId(req),
          accountId: transactionData.accountId,
          templateType: transactionData.type,
          templateAmount: transactionData.amount,
          templateDesc: transactionData.description,
          templateCategoryId: transactionData.categoryId,
          freq: frequency || "monthly",
          interval: parseInt(interval || "1"),
          startDate: new Date(transactionBody.date),
          endDate: null, // No end date for now
          timezone: "UTC",
          active: true
        });
        
        const recurringRule = await storage.createRecurringRule(recurringRuleData);
        
        // Generate future transactions (next 12 months)
        const futureTransactions = generateFutureTransactions(transactionData, recurringRule, 12);
        
        // Create all future transactions
        for (const futureTransaction of futureTransactions) {
          await storage.createTransaction({
            ...futureTransaction,
            recurringId: recurringRule.id
          });
        }
        
        console.log(`Created ${futureTransactions.length} future recurring transactions`);
        
        // Update the original transaction with the recurring ID
        await storage.updateTransaction(transaction.id, { recurringId: recurringRule.id });
      }
      
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Transaction creation error:", error);
      res.status(400).json({ 
        message: "Invalid transaction data",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.patch("/api/transactions/:id", requireAuth, async (req, res) => {
    try {
      const transaction = await storage.getTransaction(req.params.id);
      if (!transaction || transaction.userId !== getUserId(req)) {
        return res.sendStatus(404);
      }
      
      const updateData = { ...req.body };
      if (req.body.date) {
        updateData.date = new Date(req.body.date);
      }
      
      const updatedTransaction = await storage.updateTransaction(req.params.id, updateData);
      res.json(updatedTransaction);
    } catch (error) {
      res.status(400).json({ message: "Failed to update transaction" });
    }
  });

  app.delete("/api/transactions/:id", requireAuth, async (req, res) => {
    try {
      const transaction = await storage.getTransaction(req.params.id);
      if (!transaction || transaction.userId !== getUserId(req)) {
        return res.sendStatus(404);
      }
      
      await storage.deleteTransaction(req.params.id);
      res.sendStatus(200);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });

  // Recurring rules routes
  app.get("/api/recurring", requireAuth, async (req, res) => {
    try {
      const rules = await storage.getRecurringRulesByUser(getUserId(req));
      res.json(rules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recurring rules" });
    }
  });

  app.post("/api/recurring", requireAuth, async (req, res) => {
    try {
      const ruleData = insertRecurringRuleSchema.parse({
        ...req.body,
        userId: getUserId(req),
        startDate: new Date(req.body.startDate),
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined
      });
      
      const rule = await storage.createRecurringRule(ruleData);
      
      // TODO: Implement immediate materialization of recurring transactions
      // This would generate transaction instances from startDate to today + MATERIALIZE_MONTHS_AHEAD
      
      res.status(201).json(rule);
    } catch (error) {
      res.status(400).json({ message: "Invalid recurring rule data" });
    }
  });

  app.patch("/api/recurring/:id", requireAuth, async (req, res) => {
    try {
      const rule = await storage.getRecurringRule(req.params.id);
      if (!rule || rule.userId !== getUserId(req)) {
        return res.sendStatus(404);
      }
      
      const updateData = { ...req.body };
      if (req.body.startDate) updateData.startDate = new Date(req.body.startDate);
      if (req.body.endDate) updateData.endDate = new Date(req.body.endDate);
      
      const updatedRule = await storage.updateRecurringRule(req.params.id, updateData);
      res.json(updatedRule);
    } catch (error) {
      res.status(400).json({ message: "Failed to update recurring rule" });
    }
  });

  app.delete("/api/recurring/:id", requireAuth, async (req, res) => {
    try {
      const rule = await storage.getRecurringRule(req.params.id);
      if (!rule || rule.userId !== getUserId(req)) {
        return res.sendStatus(404);
      }
      
      await storage.deleteRecurringRule(req.params.id);
      res.sendStatus(200);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete recurring rule" });
    }
  });

  // Statements routes
  app.get("/api/statements/:accountId", requireAuth, async (req, res) => {
    try {
      const account = await storage.getAccount(req.params.accountId);
      if (!account || account.userId !== getUserId(req)) {
        return res.sendStatus(404);
      }
      
      const statements = await storage.getStatementsByAccount(req.params.accountId);
      res.json(statements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statements" });
    }
  });

  app.post("/api/statements/bulk", requireAuth, async (req, res) => {
    try {
      const { statements } = req.body;
      const results = [];
      
      for (const statementData of statements) {
        const account = await storage.getAccount(statementData.accountId);
        if (account && account.userId === getUserId(req)) {
          const validatedData = insertMonthlyStatementSchema.parse({
            ...statementData,
            periodStart: new Date(statementData.periodStart),
            periodEnd: new Date(statementData.periodEnd)
          });
          const statement = await storage.createStatement(validatedData);
          results.push(statement);
        }
      }
      
      res.json(results);
    } catch (error) {
      res.status(400).json({ message: "Failed to create statements" });
    }
  });

  // Summary route
  app.get("/api/summary", requireAuth, async (req, res) => {
    try {
      const { month, accountType, accountIds } = req.query;
      
      if (!month || !accountType) {
        return res.status(400).json({ message: "Month and accountType are required" });
      }

      // Parse month (YYYY-MM format)
      const [year, monthNum] = (month as string).split('-');
      const startDate = startOfMonth(new Date(parseInt(year), parseInt(monthNum) - 1));
      const endDate = endOfMonth(startDate);

      // Get user accounts
      const userAccounts = await storage.getAccountsByUser(getUserId(req));
      let filteredAccounts = userAccounts.filter(acc => acc.type === accountType);
      
      if (accountIds) {
        const ids = (accountIds as string).split(',');
        filteredAccounts = filteredAccounts.filter(acc => ids.includes(acc.id));
      }

      // Validate all accounts match the type
      const mismatchedAccounts = filteredAccounts.filter(acc => acc.type !== accountType);
      if (mismatchedAccounts.length > 0) {
        return res.status(400).json({ message: "All accounts must match the specified type" });
      }

      // Get transactions for the period
      const allTransactions = [];
      for (const account of filteredAccounts) {
        const transactions = await storage.getTransactionsByUser(getUserId(req), {
          accountId: account.id,
          startDate,
          endDate
        });
        allTransactions.push(...transactions);
      }

      // Calculate totals
      const incomeTotal = allTransactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      const expenseTotal = allTransactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      const netTotal = incomeTotal - expenseTotal;

      res.json({
        accounts: filteredAccounts,
        period: { start: startDate, end: endDate },
        totals: {
          income: incomeTotal,
          expense: expenseTotal,
          net: netTotal
        },
        transactions: allTransactions.slice(0, 20) // Limit for initial load
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate summary" });
    }
  });

  // Interest projection route
  app.get("/api/interest/projected", requireAuth, async (req, res) => {
    try {
      const { accountType, accountIds } = req.query;
      
      if (!accountType) {
        return res.status(400).json({ message: "accountType is required" });
      }

      // Get user accounts
      const userAccounts = await storage.getAccountsByUser(getUserId(req));
      let filteredAccounts = userAccounts.filter(acc => acc.type === accountType);
      
      if (accountIds) {
        const ids = (accountIds as string).split(',');
        filteredAccounts = filteredAccounts.filter(acc => ids.includes(acc.id));
      }

      // Calculate projected interest for each account
      const projections = filteredAccounts.map(account => {
        // Simple projection calculation - this would be more complex in real implementation
        const balance = parseFloat(account.openingBalance);
        const apr = account.aprApy ? parseFloat(account.aprApy) : 0;
        const monthlyRate = apr / 100 / 12;
        const projectedMonthly = balance * monthlyRate;
        
        return {
          accountId: account.id,
          accountName: account.name,
          currentBalance: balance,
          apr: apr,
          projectedMonthlyInterest: projectedMonthly,
          projectedYearlyInterest: projectedMonthly * 12
        };
      });

      res.json(projections);
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate interest projections" });
    }
  });

  // Daily balance endpoints
  app.get("/api/daily-balances/:accountId", requireAuth, async (req, res) => {
    try {
      const { accountId } = req.params;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const balances = await storage.getDailyBalancesByAccount(accountId, startDate, endDate);
      res.json(balances);
    } catch (error) {
      console.error("Error fetching daily balances:", error);
      res.status(500).json({ error: "Failed to fetch daily balances" });
    }
  });

  app.get("/api/daily-balances/:accountId/:date", requireAuth, async (req, res) => {
    try {
      const { accountId, date } = req.params;
      const balance = await storage.getDailyBalance(accountId, new Date(date));
      if (!balance) {
        return res.status(404).json({ error: "Daily balance not found" });
      }
      res.json(balance);
    } catch (error) {
      console.error("Error fetching daily balance:", error);
      res.status(500).json({ error: "Failed to fetch daily balance" });
    }
  });

  app.post("/api/daily-balances", requireAuth, async (req, res) => {
    try {
      const balance = await storage.createDailyBalance(req.body);
      res.status(201).json(balance);
    } catch (error) {
      console.error("Error creating daily balance:", error);
      res.status(500).json({ error: "Failed to create daily balance" });
    }
  });

  app.put("/api/daily-balances/:accountId/:date", requireAuth, async (req, res) => {
    try {
      const { accountId, date } = req.params;
      const { balance } = req.body;
      const updated = await storage.updateDailyBalance(accountId, new Date(date), balance);
      res.json(updated);
    } catch (error) {
      console.error("Error updating daily balance:", error);
      res.status(500).json({ error: "Failed to update daily balance" });
    }
  });

  app.post("/api/daily-balances/calculate/:accountId", requireAuth, async (req, res) => {
    try {
      const { accountId } = req.params;
      const { startDate, endDate } = req.body;
      await storage.updateDailyBalancesForAccount(
        accountId, 
        new Date(startDate), 
        new Date(endDate)
      );
      res.json({ message: "Daily balances updated successfully" });
    } catch (error) {
      console.error("Error calculating daily balances:", error);
      res.status(500).json({ error: "Failed to calculate daily balances" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
