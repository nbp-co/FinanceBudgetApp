import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, Plus, Minus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

export default function StatementsPage() {
  const [selectedMonths, setSelectedMonths] = useState<string[]>(["2024-11", "2024-10", "2024-09"]);
  const [selectedAccountTypes, setSelectedAccountTypes] = useState<string[]>(['Asset', 'Debt']);
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

  return (
    <AppShell>
      <div className="p-4 lg:p-8">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Monthly Statements</h1>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Account Types:</p>
                <div className="flex gap-4">
                  {['Asset', 'Debt'].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type}`}
                        checked={selectedAccountTypes.includes(type)}
                        onCheckedChange={() => toggleAccountType(type)}
                      />
                      <label 
                        htmlFor={`type-${type}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {type} Accounts
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Select months to edit:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                  {availableMonths.map((month) => (
                    <div key={month.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={month.value}
                        checked={selectedMonths.includes(month.value)}
                        onCheckedChange={() => toggleMonth(month.value)}
                      />
                      <label 
                        htmlFor={month.value}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {month.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <Button disabled={selectedMonths.length === 0}>
            <Save className="mr-2 h-4 w-4" />
            Save All ({selectedMonths.length})
          </Button>
        </div>

        {selectedMonths.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">Select one or more months above to edit statements</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Monthly Statements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px] sticky left-0 bg-white z-10 border-r-2 border-gray-300">Account</TableHead>
                      <TableHead className="w-[80px] sticky left-[150px] bg-white z-10 border-r-2 border-gray-300">Type</TableHead>
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
                        <TableCell className="font-medium sticky left-0 bg-white z-10 border-r-2 border-gray-300">
                          <div>
                            <div className="font-medium">
                              {account.name}
                              {account.apr && (
                                <span className="text-xs text-gray-500 ml-2">
                                  {account.type === 'Asset' ? 'APY' : 'APR'}: {account.apr}%
                                </span>
                              )}
                            </div>
                            {account.dueDate && (
                              <div className="text-xs text-gray-500">Due: {account.dueDate}th</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="sticky left-[150px] bg-white z-10 border-r-2 border-gray-300">
                          <div className="space-y-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium block text-center ${
                              account.type === 'Asset' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {account.type}
                            </span>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 block text-center">
                              {account.accountType}
                            </span>
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
            </CardContent>
          </Card>
        )}


      </div>
    </AppShell>
  );
}
