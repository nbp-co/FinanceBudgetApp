import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export default function BudgetPage() {
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Expenses Section */}
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
              <div className="space-y-6">
                {/* Primary Expenses */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Primary Expenses</h3>
                    <span className="font-semibold text-red-600">$2,353</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Mortgage Payment</p>
                        <p className="text-sm text-gray-600">Mortgage/Rent</p>
                        <p className="text-sm text-gray-500">Due: 2025-02-01</p>
                      </div>
                      <input 
                        type="text" 
                        defaultValue="1543" 
                        className="w-20 px-2 py-1 text-right border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-red-600"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Electric Bill</p>
                        <p className="text-sm text-gray-600">Home Utilities</p>
                        <p className="text-sm text-gray-500">Due: 2025-02-15</p>
                      </div>
                      <input 
                        type="text" 
                        defaultValue="125" 
                        className="w-16 px-2 py-1 text-right border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-red-600"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Gas Bill</p>
                        <p className="text-sm text-gray-600">Home Utilities</p>
                        <p className="text-sm text-gray-500">Due: 2025-02-10</p>
                      </div>
                      <input 
                        type="text" 
                        defaultValue="85" 
                        className="w-16 px-2 py-1 text-right border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-red-600"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Grocery Budget</p>
                        <p className="text-sm text-gray-600">Groceries</p>
                      </div>
                      <input 
                        type="text" 
                        defaultValue="600" 
                        className="w-16 px-2 py-1 text-right border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-red-600"
                      />
                    </div>
                  </div>
                  <Separator className="mt-4" />
                </div>

                {/* Savings/Investments */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Savings/Investments</h3>
                    <span className="font-semibold text-red-600">$820</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">401k Contribution</p>
                        <p className="text-sm text-gray-600">401(k)/Investments</p>
                      </div>
                      <input 
                        type="text" 
                        defaultValue="520" 
                        className="w-16 px-2 py-1 text-right border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-red-600"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Emergency Savings</p>
                        <p className="text-sm text-gray-600">Savings</p>
                      </div>
                      <input 
                        type="text" 
                        defaultValue="300" 
                        className="w-16 px-2 py-1 text-right border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-red-600"
                      />
                    </div>
                  </div>
                  <Separator className="mt-4" />
                </div>

                {/* Debt Expenses */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Debt Expenses</h3>
                    <span className="font-semibold text-red-600">$435</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Car Payment</p>
                        <p className="text-sm text-gray-600">Auto Loans</p>
                        <p className="text-sm text-gray-500">Due: 2025-02-05</p>
                      </div>
                      <input 
                        type="text" 
                        defaultValue="285" 
                        className="w-16 px-2 py-1 text-right border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-red-600"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Credit Card Payment</p>
                        <p className="text-sm text-gray-600">Credit Cards</p>
                        <p className="text-sm text-gray-500">Due: 2025-02-20</p>
                      </div>
                      <input 
                        type="text" 
                        defaultValue="150" 
                        className="w-16 px-2 py-1 text-right border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-red-600"
                      />
                    </div>
                  </div>
                  <Separator className="mt-4" />
                </div>

                {/* Secondary Expenses */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Secondary Expenses</h3>
                    <span className="font-semibold text-red-600">$999</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Restaurants and Bars</p>
                        <p className="text-sm text-gray-600">Restaurants and Bars</p>
                      </div>
                      <input 
                        type="text" 
                        defaultValue="400" 
                        className="w-16 px-2 py-1 text-right border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-red-600"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Monthly Subscriptions</p>
                        <p className="text-sm text-gray-600">Monthly Subscriptions</p>
                      </div>
                      <input 
                        type="text" 
                        defaultValue="89" 
                        className="w-16 px-2 py-1 text-right border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-red-600"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Entertainment</p>
                        <p className="text-sm text-gray-600">Entertainment</p>
                      </div>
                      <input 
                        type="text" 
                        defaultValue="200" 
                        className="w-16 px-2 py-1 text-right border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-red-600"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">General Spending</p>
                        <p className="text-sm text-gray-600">General Spending</p>
                      </div>
                      <input 
                        type="text" 
                        defaultValue="250" 
                        className="w-16 px-2 py-1 text-right border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-red-600"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Haircut/Grooming</p>
                        <p className="text-sm text-gray-600">Haircut/Grooming</p>
                      </div>
                      <input 
                        type="text" 
                        defaultValue="60" 
                        className="w-16 px-2 py-1 text-right border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-red-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Income Section */}
          <Card>
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
              <div className="space-y-4">
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
        </div>
      </div>
    </AppShell>
  );
}