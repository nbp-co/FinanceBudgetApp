import { AppShell } from "@/components/layout/app-shell";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, DollarSign, TrendingUp, TrendingDown, PiggyBank, CreditCard, Edit, Trash2, GripVertical } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Form schemas
const incomeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.string().min(1, "Amount is required"),
  frequency: z.enum(["weekly", "bi-weekly", "monthly", "yearly"]),
  account: z.string().min(1, "Account is required"),
  nextDate: z.string().min(1, "Next date is required"),
});

const expenseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.string().min(1, "Amount is required"),
  category: z.string().min(1, "Category is required"),
  dueDate: z.string().optional(),
});

type IncomeForm = z.infer<typeof incomeSchema>;
type ExpenseForm = z.infer<typeof expenseSchema>;

// Default categories with groups
const defaultCategories = {
  "Primary Expenses": [
    "Mortgage/Rent",
    "Home Utilities", 
    "Transportation",
    "Groceries"
  ],
  "Savings/Investments": [
    "Savings",
    "401(k)/Investments"
  ],
  "Debt Expenses": [
    "Credit Cards",
    "Student Loans",
    "Auto Loans", 
    "Other Loans/Debt"
  ],
  "Secondary Expenses": [
    "Restaurants and Bars",
    "Travel",
    "Entertainment",
    "Monthly Subscriptions",
    "General Spending",
    "Haircut/Grooming"
  ]
};

// Mock accounts for selection
const mockAccounts = [
  "Checking Account",
  "Savings Account", 
  "Business Checking",
  "Money Market"
];

export default function BudgetPage() {
  const [incomeItems, setIncomeItems] = useState([
    { id: 1, name: "Primary Salary", amount: 5200, frequency: "monthly", account: "Checking Account", nextDate: "2025-02-01" },
    { id: 2, name: "Side Business", amount: 800, frequency: "monthly", account: "Business Checking", nextDate: "2025-02-15" }
  ]);

  const [expenseItems, setExpenseItems] = useState([
    { id: 1, name: "Mortgage Payment", amount: 1542.88, category: "Mortgage/Rent", dueDate: "2025-02-01" },
    { id: 2, name: "Electric Bill", amount: 125, category: "Home Utilities", dueDate: "2025-02-15" },
    { id: 3, name: "Gas Bill", amount: 85, category: "Home Utilities", dueDate: "2025-02-10" },
    { id: 4, name: "Grocery Budget", amount: 600, category: "Groceries", dueDate: null },
    { id: 5, name: "Car Payment", amount: 285, category: "Auto Loans", dueDate: "2025-02-05" },
    { id: 6, name: "Credit Card Payment", amount: 150, category: "Credit Cards", dueDate: "2025-02-20" },
    { id: 7, name: "401k Contribution", amount: 520, category: "401(k)/Investments", dueDate: null },
    { id: 8, name: "Emergency Savings", amount: 300, category: "Savings", dueDate: null }
  ]);

  const [categories, setCategories] = useState(defaultCategories);
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);

  const incomeForm = useForm<IncomeForm>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      name: "",
      amount: "",
      frequency: "monthly",
      account: "",
      nextDate: "",
    },
  });

  const expenseForm = useForm<ExpenseForm>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      name: "",
      amount: "",
      category: "",
      dueDate: "",
    },
  });

  const handleIncomeSubmit = (data: IncomeForm) => {
    const newIncome = {
      id: Date.now(),
      name: data.name,
      amount: parseFloat(data.amount),
      frequency: data.frequency,
      account: data.account,
      nextDate: data.nextDate,
    };
    setIncomeItems([...incomeItems, newIncome]);
    setIsIncomeDialogOpen(false);
    incomeForm.reset();
  };

  const handleExpenseSubmit = (data: ExpenseForm) => {
    const newExpense = {
      id: Date.now(),
      name: data.name,
      amount: parseFloat(data.amount),
      category: data.category,
      dueDate: data.dueDate || null,
    };
    setExpenseItems([...expenseItems, newExpense]);
    setIsExpenseDialogOpen(false);
    expenseForm.reset();
  };

  // Calculate totals
  const totalIncome = incomeItems.reduce((sum, item) => {
    // Convert all to monthly for comparison
    let monthlyAmount = item.amount;
    if (item.frequency === "weekly") monthlyAmount *= 4.33;
    if (item.frequency === "bi-weekly") monthlyAmount *= 2.17;
    if (item.frequency === "yearly") monthlyAmount /= 12;
    return sum + monthlyAmount;
  }, 0);

  const totalExpenses = expenseItems.reduce((sum, item) => sum + item.amount, 0);
  const netIncome = totalIncome - totalExpenses;

  // Group expenses by category
  const expensesByGroup = Object.entries(categories).map(([groupName, categoryList]) => {
    const groupExpenses = expenseItems.filter(expense => 
      categoryList.includes(expense.category)
    );
    const groupTotal = groupExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    return {
      groupName,
      categories: categoryList,
      expenses: groupExpenses,
      total: groupTotal
    };
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getFrequencyText = (frequency: string) => {
    switch (frequency) {
      case "weekly": return "Weekly";
      case "bi-weekly": return "Bi-weekly";
      case "monthly": return "Monthly";
      case "yearly": return "Yearly";
      default: return "Monthly";
    }
  };

  return (
    <AppShell>
      <div className="p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Budget</h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Monthly Income</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingDown className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Monthly Expenses</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className={`h-8 w-8 ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Net Income</p>
                  <p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(netIncome)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Income Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold">Recurring Income</CardTitle>
                <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-1 h-4 w-4" />
                      Add Income
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add Recurring Income</DialogTitle>
                    </DialogHeader>
                    <Form {...incomeForm}>
                      <form onSubmit={incomeForm.handleSubmit(handleIncomeSubmit)} className="space-y-4">
                        <FormField
                          control={incomeForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Income Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Primary Salary" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={incomeForm.control}
                          name="amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Amount</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" placeholder="0.00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={incomeForm.control}
                          name="frequency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Frequency</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select frequency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="weekly">Weekly</SelectItem>
                                  <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                                  <SelectItem value="monthly">Monthly</SelectItem>
                                  <SelectItem value="yearly">Yearly</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={incomeForm.control}
                          name="account"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Deposit Account</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select account" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {mockAccounts.map((account) => (
                                    <SelectItem key={account} value={account}>{account}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={incomeForm.control}
                          name="nextDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Next Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button type="button" variant="outline" onClick={() => setIsIncomeDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">Add Income</Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {incomeItems.map((income) => (
                  <div key={income.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{income.name}</p>
                      <p className="text-sm text-gray-600">{income.account}</p>
                      <p className="text-sm text-gray-500">Next: {income.nextDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{formatCurrency(income.amount)}</p>
                      <p className="text-sm text-gray-500">{getFrequencyText(income.frequency)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Expenses Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold">Budget Expenses</CardTitle>
                <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-1 h-4 w-4" />
                      Add Expense
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add Budget Expense</DialogTitle>
                    </DialogHeader>
                    <Form {...expenseForm}>
                      <form onSubmit={expenseForm.handleSubmit(handleExpenseSubmit)} className="space-y-4">
                        <FormField
                          control={expenseForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Expense Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Electric Bill" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={expenseForm.control}
                          name="amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Monthly Amount</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" placeholder="0.00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={expenseForm.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Object.entries(categories).map(([groupName, categoryList]) => 
                                    categoryList.map((category) => (
                                      <SelectItem key={category} value={category}>{category}</SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={expenseForm.control}
                          name="dueDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Due Date (Optional)</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button type="button" variant="outline" onClick={() => setIsExpenseDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">Add Expense</Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {expensesByGroup.map((group) => (
                  <div key={group.groupName}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{group.groupName}</h3>
                      <span className="font-semibold text-red-600">{formatCurrency(group.total)}</span>
                    </div>
                    <div className="space-y-2">
                      {group.expenses.map((expense) => (
                        <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{expense.name}</p>
                            <p className="text-sm text-gray-600">{expense.category}</p>
                            {expense.dueDate && (
                              <p className="text-sm text-gray-500">Due: {expense.dueDate}</p>
                            )}
                          </div>
                          <p className="font-semibold text-red-600">{formatCurrency(expense.amount)}</p>
                        </div>
                      ))}
                    </div>
                    {group !== expensesByGroup[expensesByGroup.length - 1] && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}