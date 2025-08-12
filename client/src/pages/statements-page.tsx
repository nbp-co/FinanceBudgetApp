import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Save, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function StatementsPage() {
  const [selectedMonths, setSelectedMonths] = useState<string[]>(["2024-11", "2024-10", "2024-09"]);
  const [selectedAccountTypes, setSelectedAccountTypes] = useState<string[]>(['Asset', 'Debt']);
  const [sortBy, setSortBy] = useState<string>('type');
  const [selectedSubTypes, setSelectedSubTypes] = useState<string[]>(['Checking', 'Savings', 'Money Market', 'Credit Card', 'Mortgage', 'Auto Loan']);
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

  // Filter accounts based on selected types and subtypes
  const filteredAccounts = sortedAccounts.filter(account => 
    selectedAccountTypes.includes(account.type) && selectedSubTypes.includes(account.accountType)
  );

  // Sort accounts based on selected sort option
  const accounts = [...filteredAccounts].sort((a, b) => {
    if (sortBy === 'type') {
      // First sort by Asset vs Debt (Debt first to match image)
      if (a.type !== b.type) {
        return a.type === 'Debt' ? -1 : 1;
      }
      // Then sort by account type within each group
      return a.accountType.localeCompare(b.accountType);
    } else if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

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

  const toggleSubType = (subType: string) => {
    setSelectedSubTypes(prev => 
      prev.includes(subType) 
        ? prev.filter(t => t !== subType)
        : [...prev, subType]
    );
  };



  return (
    <AppShell>
      <div className="p-4 lg:p-8">
        <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border-slate-200 shadow-lg mb-6">
          <Collapsible defaultOpen={true}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-4 hover:bg-slate-100 transition-colors rounded-t-lg">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">Monthly Statements</h1>
                </div>
                <ChevronDown className="h-5 w-5 text-gray-600" />
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <CardContent className="pt-0 pb-4 space-y-6">
                {/* Filter Controls */}
                <div className="grid gap-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                  
                  {/* Account Types */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">Account Types:</Label>
                    <div className="flex gap-4">
                      {['Asset', 'Debt'].map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={`type-${type}`}
                            checked={selectedAccountTypes.includes(type)}
                            onCheckedChange={() => toggleAccountType(type)}
                            className="data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                          />
                          <Label htmlFor={`type-${type}`} className="text-sm cursor-pointer">
                            {type}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sort By */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">Sort by:</Label>
                    <RadioGroup value={sortBy} onValueChange={setSortBy} className="flex gap-6">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="type" id="sort-type" className="border-teal-600 text-teal-600" />
                        <Label htmlFor="sort-type" className="text-sm cursor-pointer">
                          Type (Debt → Asset)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="name" id="sort-name" className="border-teal-600 text-teal-600" />
                        <Label htmlFor="sort-name" className="text-sm cursor-pointer">
                          Name (A → Z)
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Filter by Sub-type */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">Filter by Sub-type:</Label>
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {['Checking', 'Business Checking', 'Savings', 'Money Market', 'Investment', 'Credit Card', 'Mortgage', 'Auto Loan', 'Student Loan', 'Line of Credit', 'Taxes'].map((subType) => (
                        <div key={subType} className="flex items-center space-x-2">
                          <Checkbox
                            id={`subtype-${subType}`}
                            checked={selectedSubTypes.includes(subType)}
                            onCheckedChange={() => toggleSubType(subType)}
                            className="data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                          />
                          <Label htmlFor={`subtype-${subType}`} className="text-sm cursor-pointer">
                            {subType}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Select months to edit */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">Select months to edit:</Label>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                      {availableMonths.map((month) => (
                        <div key={month.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`month-${month.value}`}
                            checked={selectedMonths.includes(month.value)}
                            onCheckedChange={() => toggleMonth(month.value)}
                            className="data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                          />
                          <Label htmlFor={`month-${month.value}`} className="text-sm cursor-pointer">
                            {month.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-2">
                    <Button 
                      disabled={selectedMonths.length === 0}
                      className="bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save All ({selectedMonths.length})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

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
                      <TableBody className="bg-white">
                        {accounts.map((account, accountIndex) => (
                          <TableRow key={account.name} className="border-b border-gray-200 hover:bg-gray-50">
                            <TableCell className="py-4 px-4 border-r border-gray-300">
                              <div className="space-y-2">
                                <div className="font-semibold text-gray-900">{account.name}</div>
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

                            {selectedMonths.map((monthValue, monthIndex) => (
                              <TableCell key={`${account.name}-${monthValue}`} className={`text-center py-4 px-3 ${monthIndex < selectedMonths.length - 1 ? 'border-r border-gray-300' : ''}`}>
                                <div className="space-y-3">
                                  <div className="relative">
                                    <div className="text-xs text-gray-400 font-medium mb-1">B</div>
                                    <div className="flex items-center justify-center">
                                      <span className="text-sm text-gray-500 mr-1">$</span>
                                      <Input
                                        type="text"
                                        defaultValue={
                                          account.name === "Auto Loan" ? "18,450.00" :
                                          account.name === "Credit Card" ? "2,456.78" :
                                          account.name === "Checking Account" ? "12,345.67" :
                                          account.name === "Savings Account" ? "25,890.12" :
                                          account.name === "Money Market" ? "8,500.00" :
                                          account.name === "Mortgage" ? "285,000.00" :
                                          "15,250.00"
                                        }
                                        className="w-24 text-center border-0 p-0 text-sm font-medium bg-transparent focus:ring-0 focus:outline-none"
                                      />
                                    </div>
                                  </div>
                                  {account.type === 'Debt' && (
                                    <div className="relative">
                                      <div className="text-xs text-gray-400 font-medium mb-1">I</div>
                                      <div className="flex items-center justify-center">
                                        <span className="text-sm text-gray-500 mr-1">$</span>
                                        <span className="text-sm text-red-600 italic font-medium">
                                          {account.name === "Auto Loan" ? "78.95" :
                                           account.name === "Credit Card" ? "47.23" :
                                           account.name === "Mortgage" ? "1,542.88" :
                                           "78.95"}
                                        </span>
                                      </div>
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
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
