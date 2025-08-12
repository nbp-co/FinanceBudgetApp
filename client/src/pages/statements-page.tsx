import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Save, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
          <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border-slate-200 shadow-lg">
            <Collapsible defaultOpen={true}>
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between p-4 hover:bg-slate-100 transition-colors rounded-t-lg">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">Monthly Statements</h3>
                  </div>
                  <ChevronDown className="h-5 w-5 text-gray-600" />
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="pt-0 pb-4 space-y-4">
                  <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
                    <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-400 h-10 border-none">
                            <TableHead className="font-bold text-white py-3 px-4 rounded-tl-lg border-r border-gray-300">ACCOUNT</TableHead>
                            {selectedMonths.map((monthValue, index) => {
                              const monthLabel = availableMonths.find(m => m.value === monthValue)?.label || monthValue;
                              return (
                                <TableHead key={monthValue} className={`text-center font-bold text-white py-3 px-3 ${index === selectedMonths.length - 1 ? 'rounded-tr-lg' : 'border-r border-gray-300'}`}>
                                  {monthLabel.toUpperCase()}
                                </TableHead>
                              );
                            })}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {accounts.map((account, accountIndex) => (
                            <TableRow key={account.name} className="hover:bg-gray-50">
                              <TableCell className="font-medium py-4 px-4 text-gray-900 border-r border-gray-200">
                                <div className="space-y-1">
                                  <div className="text-sm font-semibold">{account.name}</div>
                                  <div className="flex gap-2">
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                      account.type === 'Asset' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {account.type}
                                    </span>
                                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                      {account.accountType}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {account.apr && (
                                      <div>{account.type === 'Asset' ? 'APY' : 'APR'}: {account.apr}%</div>
                                    )}
                                    {account.dueDate && (
                                      <div>Due: {account.dueDate}th</div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>

                              {selectedMonths.map((monthValue, monthIndex) => (
                                <TableCell key={`${account.name}-${monthValue}`} className={`text-center py-4 px-3 ${monthIndex < selectedMonths.length - 1 ? 'border-r border-gray-200' : ''}`}>
                                  <div className="space-y-2">
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
                                        className="w-32 text-center pl-6 text-sm font-medium"
                                      />
                                      <span className="absolute -top-1 -left-1 text-xs text-gray-400 font-medium">BAL</span>
                                    </div>
                                    {account.type === 'Debt' && (
                                      <div className="text-xs text-red-600 italic font-medium">
                                        Interest: ${
                                          account.name === "Credit Card" ? "47.23" :
                                          account.name === "Mortgage" ? "1,542.88" :
                                          "78.95"
                                        }
                                      </div>
                                    )}
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
      </div>
    </AppShell>
  );
}
