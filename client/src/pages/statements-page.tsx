import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Save, ChevronDown, Filter } from "lucide-react";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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
          <CardContent className="p-4 space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Monthly Statements</h1>
            
            {/* Filter Controls */}
            <div className="flex justify-between items-start gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              {/* Select months to edit */}
              <div className="flex-1">
                <Label className="text-sm font-medium text-gray-700 mb-3 block">Select months to edit:</Label>
                <div className="flex flex-wrap gap-3">
                  {availableMonths.map((month) => (
                    <div key={month.value} className="flex items-center space-x-2 whitespace-nowrap">
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

              {/* Sort & Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Sort & Filter
                  </Button>
                </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80 p-4" align="start">
                      <div className="space-y-6">
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
                          <RadioGroup value={sortBy} onValueChange={setSortBy} className="space-y-2">
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
                          <div className="grid grid-cols-2 gap-2">
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
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>

              {/* Save Button */}
              <Button 
                disabled={selectedMonths.length === 0}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                <Save className="mr-2 h-4 w-4" />
                Save All ({selectedMonths.length})
              </Button>
            </div>
            {selectedMonths.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500">Select one or more months above to edit statements</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm bg-white">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-400 h-6 border-none">
                      <TableHead className="font-bold text-white py-1 px-2 rounded-tl-lg border-r border-gray-300 text-xs leading-tight">ACCOUNT</TableHead>
                      {selectedMonths.map((monthValue, index) => {
                        const monthLabel = availableMonths.find(m => m.value === monthValue)?.label || monthValue;
                        return (
                          <TableHead key={monthValue} className={`text-center font-bold text-white py-1 px-2 text-xs leading-tight ${index === selectedMonths.length - 1 ? 'rounded-tr-lg' : 'border-r border-gray-300'}`}>
                            {monthLabel.toUpperCase()}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white">
                    {accounts.map((account, accountIndex) => (
                      <TableRow key={account.name} className="border-b border-gray-200 hover:bg-gray-50">
                        <TableCell className="py-0.5 px-2 border-r border-gray-300">
                          <div className="space-y-0.5">
                            <div className="font-semibold text-gray-900 text-xs leading-tight">{account.name}</div>
                            <div className="flex gap-1">
                              <span className={`px-1 py-0 rounded text-xs font-medium leading-tight ${
                                account.type === 'Asset' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {account.type}
                              </span>
                              <span className="px-1 py-0 rounded text-xs font-medium bg-gray-100 text-gray-700 leading-tight">
                                {account.accountType}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 leading-tight">
                              {account.apr && (
                                <span>{account.type === 'Asset' ? 'APY' : 'APR'}: {account.apr}%</span>
                              )}
                              {account.dueDate && (
                                <span className="ml-2">Due: {account.dueDate}th</span>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {selectedMonths.map((monthValue, monthIndex) => (
                          <TableCell key={`${account.name}-${monthValue}`} className={`py-0.5 px-2 ${monthIndex < selectedMonths.length - 1 ? 'border-r border-gray-300' : ''}`}>
                            <div className="space-y-0.5">
                              <div className="flex items-center">
                                <span className="text-xs text-gray-400 font-medium leading-tight mr-1">B</span>
                                <span className="text-xs text-gray-500 mr-1">$</span>
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
                                  className="flex-1 border-0 p-0 text-xs font-medium bg-transparent focus:ring-0 focus:outline-none leading-tight"
                                />
                              </div>
                              {account.type === 'Debt' && (
                                <div className="flex items-center">
                                  <span className="text-xs text-gray-400 font-medium leading-tight mr-1">I</span>
                                  <span className="text-xs text-gray-500 mr-1">$</span>
                                  <Input
                                    type="text"
                                    defaultValue={
                                      account.name === "Auto Loan" ? "78.95" :
                                      account.name === "Credit Card" ? "47.23" :
                                      account.name === "Mortgage" ? "1,542.88" :
                                      "78.95"
                                    }
                                    className="flex-1 border-0 p-0 text-xs font-medium bg-transparent focus:ring-0 focus:outline-none text-red-600 italic leading-tight"
                                  />
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
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
