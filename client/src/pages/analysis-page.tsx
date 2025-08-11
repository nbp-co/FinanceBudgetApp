import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { formatCurrency } from "@/lib/utils";

const incomeExpenseData = [
  { month: 'Jul', income: 4500, expense: 3200 },
  { month: 'Aug', income: 4500, expense: 2800 },
  { month: 'Sep', income: 4500, expense: 3400 },
  { month: 'Oct', income: 4500, expense: 2900 },
  { month: 'Nov', income: 4500, expense: 2600 },
];

const categoryData = [
  { name: 'Housing', value: 1800, color: '#f97316' },
  { name: 'Groceries', value: 450, color: '#8b5cf6' },
  { name: 'Transportation', value: 320, color: '#3b82f6' },
  { name: 'Entertainment', value: 230, color: '#10b981' },
  { name: 'Other', value: 180, color: '#6b7280' },
];

export default function AnalysisPage() {
  return (
    <AppShell>
      <div className="p-4 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analysis</h1>
            <p className="text-gray-600">Analyze your spending patterns and trends</p>
          </div>
          <div className="flex items-center space-x-3">
            <Select defaultValue="assets">
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Account Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="assets">Assets</SelectItem>
                <SelectItem value="debts">Debts</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Select Accounts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                <SelectItem value="checking">Checking Account</SelectItem>
                <SelectItem value="savings">Savings Account</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income vs Expense Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Income vs Expense Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={incomeExpenseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [formatCurrency(Number(value)), name === 'income' ? 'Income' : 'Expense']}
                    />
                    <Bar dataKey="income" fill="hsl(var(--chart-1))" name="income" />
                    <Bar dataKey="expense" fill="hsl(var(--chart-2))" name="expense" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Expense by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Expense by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Amount']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryData.map((category, index) => {
                const percentage = (category.value / categoryData.reduce((sum, c) => sum + c.value, 0)) * 100;
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full" 
                          style={{ 
                            width: `${percentage}%`, 
                            backgroundColor: category.color 
                          }}
                        />
                      </div>
                      <span className="font-semibold min-w-[80px] text-right">
                        {formatCurrency(category.value)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
