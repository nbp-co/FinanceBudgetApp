import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DebtPayoffCalculator } from "@/components/accounts/debt-payoff-calculator";
import { useQuery } from "@tanstack/react-query";
import type { Account } from "@shared/schema";

export default function StatementsPage() {
  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
  });

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
                  <div className="space-y-3">
                    {/* Row 1: JAN-MAR */}
                    <div className="grid grid-cols-3 gap-3">
                      {availableMonths.slice(0, 3).map((month) => (
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
                    
                    {/* Row 2: APR-JUN */}
                    <div className="grid grid-cols-3 gap-3">
                      {availableMonths.slice(3, 6).map((month) => (
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
                    
                    {/* Row 3: JUL-SEP */}
                    <div className="grid grid-cols-3 gap-3">
                      {availableMonths.slice(6, 9).map((month) => (
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
                    
                    {/* Row 4: OCT-DEC */}
                    <div className="grid grid-cols-3 gap-3">
                      {availableMonths.slice(9, 12).map((month) => (
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
                          <RadioGroup value={sortBy} onValueChange={(value) => setSortBy(value as 'name' | 'type' | 'name-reverse' | 'type-reverse')} className="space-y-2">
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="debt-payoff" className="space-y-6">
            <DebtPayoffCalculator accounts={accounts} />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}