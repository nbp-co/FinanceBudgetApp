import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Plus, TrendingUp, TrendingDown, DollarSign, ChevronDown, ChevronUp, X, GripVertical, Edit, Save } from "lucide-react";
import { useState } from "react";

export default function BudgetPage() {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    primary: true,
    savings: true,
    debt: true,
    secondary: true
  });

  const [editingCategories, setEditingCategories] = useState<Record<string, boolean>>({
    primary: false,
    savings: false,
    debt: false,
    secondary: false
  });

  const [expenses, setExpenses] = useState({
    primary: [
      { id: 1, name: "Mortgage Payment", category: "Mortgage/Rent", amount: "1543", dueDate: "2025-02-01" },
      { id: 2, name: "Electric Bill", category: "Home Utilities", amount: "125", dueDate: "2025-02-15" },
      { id: 3, name: "Gas Bill", category: "Home Utilities", amount: "85", dueDate: "2025-02-10" },
      { id: 4, name: "Grocery Budget", category: "Groceries", amount: "600", dueDate: null }
    ],
    savings: [
      { id: 5, name: "401k Contribution", category: "401(k)/Investments", amount: "520", dueDate: null },
      { id: 6, name: "Emergency Savings", category: "Savings", amount: "300", dueDate: null }
    ],
    debt: [
      { id: 7, name: "Car Payment", category: "Auto Loans", amount: "285", dueDate: "2025-02-05" },
      { id: 8, name: "Credit Card Payment", category: "Credit Cards", amount: "150", dueDate: "2025-02-20" }
    ],
    secondary: [
      { id: 9, name: "Restaurants and Bars", category: "Restaurants and Bars", amount: "400", dueDate: null },
      { id: 10, name: "Monthly Subscriptions", category: "Monthly Subscriptions", amount: "89", dueDate: null },
      { id: 11, name: "Entertainment", category: "Entertainment", amount: "200", dueDate: null },
      { id: 12, name: "General Spending", category: "General Spending", amount: "250", dueDate: null },
      { id: 13, name: "Haircut/Grooming", category: "Haircut/Grooming", amount: "60", dueDate: null }
    ]
  });

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const toggleEditing = (category: string) => {
    setEditingCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const addExpense = (categoryKey: keyof typeof expenses) => {
    const newId = Math.max(...Object.values(expenses).flat().map(e => e.id)) + 1;
    const newExpense = {
      id: newId,
      name: "New Expense",
      category: "General",
      amount: "0",
      dueDate: null
    };
    
    setExpenses(prev => ({
      ...prev,
      [categoryKey]: [...prev[categoryKey], newExpense]
    }));
  };

  const deleteExpense = (categoryKey: keyof typeof expenses, expenseId: number) => {
    setExpenses(prev => ({
      ...prev,
      [categoryKey]: prev[categoryKey].filter(e => e.id !== expenseId)
    }));
  };

  const updateExpense = (categoryKey: keyof typeof expenses, expenseId: number, field: string, value: string) => {
    setExpenses(prev => ({
      ...prev,
      [categoryKey]: prev[categoryKey].map(e => 
        e.id === expenseId ? { ...e, [field]: value } : e
      )
    }));
  };

  const getCategoryTotal = (categoryKey: keyof typeof expenses) => {
    return expenses[categoryKey].reduce((sum, expense) => sum + parseFloat(expense.amount || "0"), 0);
  };

  const categories = [
    { key: 'primary', name: 'Primary Expenses', color: 'text-red-600' },
    { key: 'savings', name: 'Savings/Investments', color: 'text-red-600' },
    { key: 'debt', name: 'Debt Expenses', color: 'text-red-600' },
    { key: 'secondary', name: 'Secondary Expenses', color: 'text-red-600' }
  ];

  return (
    <AppShell>
      <div className="px-4 py-6 sm:px-6 lg:px-8">
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
                  <p className="text-2xl font-bold text-green-600">$6,000</p>
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
                  <p className="text-2xl font-bold text-red-600">$4,607</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Net Income</p>
                  <p className="text-2xl font-bold text-green-600">$1,393</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Income Section - Top */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">Recurring Income</CardTitle>
              <Button size="sm">
                <Plus className="mr-1 h-4 w-4" />
                Add Income
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Primary Salary</p>
                  <p className="text-sm text-gray-600">Checking Account</p>
                  <p className="text-sm text-gray-500">Next: 2025-02-01</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">$5,200</p>
                  <p className="text-sm text-gray-500">Monthly</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Side Business</p>
                  <p className="text-sm text-gray-600">Business Checking</p>
                  <p className="text-sm text-gray-500">Next: 2025-02-15</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">$800</p>
                  <p className="text-sm text-gray-500">Monthly</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expenses Section - Bottom */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">Budget Expenses</CardTitle>
              <Button size="sm">
                <Plus className="mr-1 h-4 w-4" />
                Add Expense
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categories.map((category) => (
                <Collapsible
                  key={category.key}
                  open={openCategories[category.key]}
                  onOpenChange={() => toggleCategory(category.key)}
                >
                  <div className="border border-gray-200 rounded-lg">
                    <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        {openCategories[category.key] ? (
                          <ChevronDown className="h-4 w-4 text-gray-600" />
                        ) : (
                          <ChevronUp className="h-4 w-4 text-gray-600" />
                        )}
                        <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-semibold ${category.color}`}>
                          ${getCategoryTotal(category.key as keyof typeof expenses).toLocaleString()}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleEditing(category.key);
                          }}
                          className="h-7 px-2"
                        >
                          {editingCategories[category.key] ? (
                            <Save className="h-3 w-3" />
                          ) : (
                            <Edit className="h-3 w-3" />
                          )}
                        </Button>
                        {editingCategories[category.key] && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              addExpense(category.key as keyof typeof expenses);
                            }}
                            className="h-7 px-2"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="px-4 pb-4 space-y-2">
                        {expenses[category.key as keyof typeof expenses].map((expense, index) => (
                          <div key={expense.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group">
                            {editingCategories[category.key] && (
                              <GripVertical className="h-4 w-4 text-gray-400 cursor-move opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                            
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                              {editingCategories[category.key] ? (
                                <input
                                  type="text"
                                  value={expense.name}
                                  onChange={(e) => updateExpense(category.key as keyof typeof expenses, expense.id, 'name', e.target.value)}
                                  className="font-medium bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1"
                                  placeholder="Expense name"
                                />
                              ) : (
                                <p className="font-medium">{expense.name}</p>
                              )}
                              
                              {editingCategories[category.key] ? (
                                <input
                                  type="text"
                                  value={expense.category}
                                  onChange={(e) => updateExpense(category.key as keyof typeof expenses, expense.id, 'category', e.target.value)}
                                  className="text-sm text-gray-600 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1"
                                  placeholder="Category"
                                />
                              ) : (
                                <p className="text-sm text-gray-600">{expense.category}</p>
                              )}
                              
                              {expense.dueDate && (
                                editingCategories[category.key] ? (
                                  <input
                                    type="date"
                                    value={expense.dueDate}
                                    onChange={(e) => updateExpense(category.key as keyof typeof expenses, expense.id, 'dueDate', e.target.value)}
                                    className="text-sm text-gray-500 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1"
                                  />
                                ) : (
                                  <p className="text-sm text-gray-500">Due: {expense.dueDate}</p>
                                )
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">$</span>
                              {editingCategories[category.key] ? (
                                <input
                                  type="text"
                                  value={expense.amount}
                                  onChange={(e) => updateExpense(category.key as keyof typeof expenses, expense.id, 'amount', e.target.value)}
                                  className="w-20 px-2 py-1 text-right border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-red-600"
                                />
                              ) : (
                                <p className="w-20 text-right font-semibold text-red-600">{expense.amount}</p>
                              )}
                              
                              {editingCategories[category.key] && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deleteExpense(category.key as keyof typeof expenses, expense.id)}
                                  className="h-7 w-7 p-0 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}