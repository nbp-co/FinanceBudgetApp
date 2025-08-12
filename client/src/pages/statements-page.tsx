import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, Plus, Minus, ChevronDown, ChevronUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

export default function StatementsPage() {
  const [selectedMonths, setSelectedMonths] = useState<string[]>(["2024-11", "2024-10", "2024-09"]);
  const [selectedAccountTypes, setSelectedAccountTypes] = useState<string[]>(['Asset', 'Debt']);
  const [isStatementsOpen, setIsStatementsOpen] = useState(true);
  const availableMonths = [
    { value: "2024-12", label: "Dec 2024" },
    { value: "2024-11", label: "Nov 2024" },
    { value: "2024-10", label: "Oct 2024" },
    { value: "2024-09", label: "Sep 2024" },
    { value: "2024-08", label: "Aug 2024" },
    { value: "2024-07", label: "Jul 2024" },
  ];

  const allAccounts = [
    { name: "Checking Account", type: "Asset", accountType: "Checking", apr: null, dueDate: null },
    { name: "Savings Account", type: "Asset", accountType: "Savings", apr: 4.25, dueDate: null },
    { name: "Money Market", type: "Asset", accountType: "Money Market", apr: 3.5, dueDate: null },
    { name: "Credit Card", type: "Debt", accountType: "Credit Card", apr: 24.99, dueDate: 15 },
    { name: "Mortgage", type: "Debt", accountType: "Mortgage", apr: 6.5, dueDate: 1 },
    { name: "Auto Loan", type: "Debt", accountType: "Auto Loan", apr: 5.2, dueDate: 10 },
  ];

  // Sort accounts by type and subtype
  const sortedAccounts = allAccounts.sort((a, b) => {
    // First sort by Asset vs Debt (Asset first)
    if (a.type !== b.type) {
      return a.type === 'Asset' ? -1 : 1;
    }
    // Then sort by account type within each group
    return a.accountType.localeCompare(b.accountType);
  });

  // Filter accounts based on selected types
  const accounts = sortedAccounts.filter(account => 
    selectedAccountTypes.includes(account.type)
  );

  const toggleMonth = (monthValue: string) => {
    setSelectedMonths(prev => 
      prev.includes(monthValue) 
        ? prev.filter(m => m !== monthValue)
        : [...prev, monthValue].sort().reverse()
    );
  };

  const toggleAccountType = (accountType: string) => {
    setSelectedAccountTypes(prev => 
      prev.includes(accountType) 
        ? prev.filter(t => t !== accountType)
        : [...prev, accountType]
    );
  };

  // Interest data by month - debt accounts only
  const interestData = [
    {
      month: 'Jul 2024',
      'Credit Card': 47.23,
      'Mortgage': 1542.88,
      'Auto Loan': 78.95,
    },
    {
      month: 'Aug 2024',
      'Credit Card': 47.23,
      'Mortgage': 1542.88,
      'Auto Loan': 78.95,
    },
    {
      month: 'Sep 2024',
      'Credit Card': 47.23,
      'Mortgage': 1542.88,
      'Auto Loan': 78.95,
    },
    {
      month: 'Oct 2024',
      'Credit Card': 47.23,
      'Mortgage': 1542.88,
      'Auto Loan': 78.95,
    },
    {
      month: 'Nov 2024',
      'Credit Card': 47.23,
      'Mortgage': 1542.88,
      'Auto Loan': 78.95,
    },
    {
      month: 'Dec 2024',
      'Credit Card': 47.23,
      'Mortgage': 1542.88,
      'Auto Loan': 78.95,
    },
  ];

  // Colors for different account sub-types
  const chartColors = {
    'Credit Card': '#ef4444', // red
    'Mortgage': '#f97316', // orange
    'Auto Loan': '#eab308', // yellow
    'Savings': '#22c55e', // green
    'Money Market': '#3b82f6', // blue
  };

  return (
    <AppShell>
      <div className="p-4 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-6">Monthly Statements</h1>
          
          {/* Enhanced Filter Controls */}
          <div className="flex items-center justify-between gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
            
            {/* Account Type Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Account Types:</label>
              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                {['Asset', 'Debt'].map((type) => (
                  <Button
                    key={type}
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleAccountType(type)}
                    className={`h-8 px-3 text-xs ${
                      selectedAccountTypes.includes(type)
                        ? 'bg-white text-blue-700 hover:bg-white shadow-sm' 
                        : 'text-gray-600 hover:bg-slate-200'
                    }`}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            {/* Month Selection */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Months:</label>
              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 max-w-md overflow-x-auto">
                {availableMonths.map((month) => (
                  <Button
                    key={month.value}
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleMonth(month.value)}
                    className={`h-8 px-2 text-xs whitespace-nowrap ${
                      selectedMonths.includes(month.value)
                        ? 'bg-white text-blue-700 hover:bg-white shadow-sm' 
                        : 'text-gray-600 hover:bg-slate-200'
                    }`}
                  >
                    {month.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <Button 
              disabled={selectedMonths.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="mr-2 h-4 w-4" />
              Save All ({selectedMonths.length})
            </Button>
          </div>
        </div>

        {selectedMonths.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">Select one or more months above to edit statements</p>
            </CardContent>
          </Card>
        ) : (
          <Collapsible open={isStatementsOpen} onOpenChange={setIsStatementsOpen}>
            <Card>
              <CardHeader>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                    <CardTitle>Monthly Statements</CardTitle>
                    {isStatementsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent>
                  <div className="relative">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[280px] sticky left-0 bg-white z-20 border-r-2 border-gray-400">Account</TableHead>
                            {selectedMonths.map(monthValue => {
                              const monthLabel = availableMonths.find(m => m.value === monthValue)?.label || monthValue;
                              return (
                                <TableHead key={monthValue} className="text-center min-w-[120px]">
                                  {monthLabel}
                                </TableHead>
                              );
                            })}
                          </TableRow>
                        </TableHeader>
                  <TableBody>
                    {accounts.map((account, accountIndex) => (
                      <TableRow key={account.name}>
                        <TableCell className="font-medium sticky left-0 bg-white z-20">
                          <div>
                            <div className="font-medium">{account.name}</div>
                            <div className="flex flex-wrap justify-center gap-1 mt-1 mb-2">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-center ${
                                account.type === 'Asset' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {account.type}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 text-center">
                                {account.accountType}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 space-y-0.5">
                              {account.apr && (
                                <div>{account.type === 'Asset' ? 'APY' : 'APR'}: {account.apr}%</div>
                              )}
                              {account.dueDate && (
                                <div>Due: {account.dueDate}th</div>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {selectedMonths.map(monthValue => (
                          <TableCell key={`${account.name}-${monthValue}`} className="text-center">
                            <div className="space-y-1">
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                                <Input
                                  type="text"
                                  defaultValue={
                                    account.name === "Checking Account" ? "12,345.67" :
                                    account.name === "Savings Account" ? "25,890.12" :
                                    account.name === "Money Market" ? "8,500.00" :
                                    account.name === "Credit Card" ? "2,456.78" :
                                    account.name === "Mortgage" ? "285,000.00" :
                                    "15,250.00"
                                  }
                                  className="w-28 text-center pl-6"
                                />
                                <span className="absolute -top-1 -left-1 text-xs text-gray-400 font-medium">B</span>
                              </div>
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">$</span>
                                <Input
                                  type="text"
                                  defaultValue={
                                    account.name === "Checking Account" ? "0.00" :
                                    account.name === "Savings Account" ? "95.43" :
                                    account.name === "Money Market" ? "25.18" :
                                    account.name === "Credit Card" ? "47.23" :
                                    account.name === "Mortgage" ? "1,542.88" :
                                    "78.95"
                                  }
                                  className="w-28 text-center text-xs pl-6"
                                />
                                <span className="absolute -top-1 -left-1 text-xs text-gray-400 font-medium">I</span>
                              </div>
                            </div>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                      </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        {/* Interest Chart - Debt Accounts Only */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Monthly Interest Expense by Debt Account</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={interestData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <RechartsTooltip 
                    formatter={(value, name) => [`$${value}`, `${name} Interest`]}
                    labelFormatter={(label) => `Month: ${label}`}
                    labelStyle={{ 
                      color: '#374151',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      marginBottom: '4px'
                    }}
                    contentStyle={{ 
                      backgroundColor: '#ffffff',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      padding: '12px',
                      minWidth: '180px',
                      fontSize: '13px'
                    }}
                    itemStyle={{
                      color: '#374151',
                      fontSize: '13px',
                      fontWeight: '500',
                      padding: '2px 0'
                    }}
                    cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                  />
                  <Legend />
                  <Bar dataKey="Credit Card" stackId="a" fill={chartColors['Credit Card']} />
                  <Bar dataKey="Mortgage" stackId="a" fill={chartColors['Mortgage']} />
                  <Bar dataKey="Auto Loan" stackId="a" fill={chartColors['Auto Loan']} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
