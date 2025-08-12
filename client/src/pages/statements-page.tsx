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
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'name-reverse' | 'type-reverse'>('type');
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
    } else if (sortBy === 'type-reverse') {
      // First sort by Asset vs Debt (Asset first)
      if (a.type !== b.type) {
        return a.type === 'Asset' ? -1 : 1;
      }
      // Then sort by account type within each group
      return a.accountType.localeCompare(b.accountType);
    } else if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'name-reverse') {
      return b.name.localeCompare(a.name);
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
                {/* Month Selection */}
                <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm mb-4">
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

                {/* Controls */}
                <div className="flex justify-between items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-4">
                    {/* Filter Dropdown */}
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium text-gray-700">Filter:</Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="min-w-[120px] justify-between">
                            {selectedAccountTypes.length === 2 ? 'All Types' : 
                             selectedAccountTypes.length === 1 ? selectedAccountTypes[0] + ' Only' : 
                             'No Types'}
                            <ChevronDown className="h-4 w-4 ml-2" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 p-3" align="start">
                          <div className="space-y-3">
                            <div>
                              <Label className="text-sm font-medium text-gray-700 mb-2 block">Account Types:</Label>
                              <div className="space-y-2">
                                {['Asset', 'Debt'].map((type) => (
                                  <div key={type} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`filter-type-${type}`}
                                      checked={selectedAccountTypes.includes(type)}
                                      onCheckedChange={() => toggleAccountType(type)}
                                      className="data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                                    />
                                    <Label htmlFor={`filter-type-${type}`} className="text-sm cursor-pointer">
                                      {type}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700 mb-2 block">Sub-types:</Label>
                              <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto">
                                {['Checking', 'Business Checking', 'Savings', 'Money Market', 'Investment', 'Credit Card', 'Mortgage', 'Auto Loan', 'Student Loan', 'Line of Credit', 'Taxes'].map((subType) => (
                                  <div key={subType} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`filter-subtype-${subType}`}
                                      checked={selectedSubTypes.includes(subType)}
                                      onCheckedChange={() => toggleSubType(subType)}
                                      className="data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                                    />
                                    <Label htmlFor={`filter-subtype-${subType}`} className="text-sm cursor-pointer">
                                      {subType}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Sort Dropdown */}
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium text-gray-700">Sort:</Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="min-w-[140px] justify-between">
                            {sortBy === 'type' ? 'Type (Debt → Asset)' : 
                             sortBy === 'type-reverse' ? 'Type (Asset → Debt)' :
                             sortBy === 'name' ? 'Name (A → Z)' : 
                             sortBy === 'name-reverse' ? 'Name (Z → A)' : 'Type (Debt → Asset)'}
                            <ChevronDown className="h-4 w-4 ml-2" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 p-2" align="start">
                          <RadioGroup value={sortBy} onValueChange={setSortBy} className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="type" id="sort-type" className="border-teal-600 text-teal-600" />
                              <Label htmlFor="sort-type" className="text-sm cursor-pointer">
                                Type (Debt → Asset)
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="type-reverse" id="sort-type-reverse" className="border-teal-600 text-teal-600" />
                              <Label htmlFor="sort-type-reverse" className="text-sm cursor-pointer">
                                Type (Asset → Debt)
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="name" id="sort-name" className="border-teal-600 text-teal-600" />
                              <Label htmlFor="sort-name" className="text-sm cursor-pointer">
                                Name (A → Z)
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="name-reverse" id="sort-name-reverse" className="border-teal-600 text-teal-600" />
                              <Label htmlFor="sort-name-reverse" className="text-sm cursor-pointer">
                                Name (Z → A)
                              </Label>
                            </div>
                          </RadioGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Save Button */}
                  <Button 
                    disabled={selectedMonths.length === 0}
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save All ({selectedMonths.length})
                  </Button>
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
                  <div className="overflow-x-auto rounded-lg border-2 border-gray-300 shadow-sm">
                    <Table className="border-separate border-spacing-0">
                      <TableHeader>
                        <TableRow className="border-none">
                          <TableHead className="font-bold text-gray-800 py-4 px-4 bg-gray-200 border-r border-gray-300 rounded-tl-lg">
                            ACCOUNT
                          </TableHead>
                          {selectedMonths.map((monthValue, index) => {
                            const monthLabel = availableMonths.find(m => m.value === monthValue)?.label || monthValue;
                            const [month, year] = monthLabel.split(' ');
                            return (
                              <TableHead key={monthValue} className={`text-center py-4 px-3 bg-gray-400 text-white font-bold ${index === selectedMonths.length - 1 ? 'rounded-tr-lg' : 'border-r border-gray-300'}`}>
                                <div className="flex flex-col items-center">
                                  <div className="text-sm font-bold">{month.slice(0, 3).toUpperCase()}</div>
                                  <div className="text-sm font-bold">{year}</div>
                                </div>
                              </TableHead>
                            );
                          })}
                        </TableRow>
                      </TableHeader>
                      <TableBody className="bg-white">
                        {accounts.map((account, accountIndex) => (
                          <TableRow key={account.name} className="border-b border-gray-200 hover:bg-gray-50">
                            <TableCell className="py-6 px-4 border-r border-gray-300">
                              <div className="space-y-3">
                                <div className="font-semibold text-gray-900 text-base">{account.name}</div>
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
                                <div className="text-xs text-gray-500 space-y-1">
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
                              <TableCell key={`${account.name}-${monthValue}`} className={`py-6 px-4 ${monthIndex < selectedMonths.length - 1 ? 'border-r border-gray-300' : ''}`}>
                                <div className="space-y-4">
                                  <div>
                                    <div className="text-xs text-gray-400 font-medium mb-2">B</div>
                                    <div className="flex items-center">
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
                                        className="flex-1 border-0 p-0 text-sm font-medium bg-transparent focus:ring-0 focus:outline-none"
                                      />
                                    </div>
                                  </div>
                                  {account.type === 'Debt' && (
                                    <div>
                                      <div className="text-xs text-gray-400 font-medium mb-2">I</div>
                                      <div className="flex items-center">
                                        <span className="text-sm text-gray-500 mr-1">$</span>
                                        <Input
                                          type="text"
                                          defaultValue={
                                            account.name === "Auto Loan" ? "78.95" :
                                            account.name === "Credit Card" ? "47.23" :
                                            account.name === "Mortgage" ? "1,542.88" :
                                            "78.95"
                                          }
                                          className="flex-1 border-0 p-0 text-sm font-medium bg-transparent focus:ring-0 focus:outline-none text-red-600 italic"
                                        />
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
