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
  const availableMonths = [
    { value: "2024-12", label: "Dec 2024" },
    { value: "2024-11", label: "Nov 2024" },
    { value: "2024-10", label: "Oct 2024" },
    { value: "2024-09", label: "Sep 2024" },
    { value: "2024-08", label: "Aug 2024" },
    { value: "2024-07", label: "Jul 2024" },
  ];

  const accounts = [
    { name: "Checking Account", type: "Asset" },
    { name: "Savings Account", type: "Asset" },
    { name: "Credit Card", type: "Debt" },
  ];

  const toggleMonth = (monthValue: string) => {
    setSelectedMonths(prev => 
      prev.includes(monthValue) 
        ? prev.filter(m => m !== monthValue)
        : [...prev, monthValue].sort().reverse()
    );
  };

  return (
    <AppShell>
      <div className="p-4 lg:p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-4">Monthly Statements</h1>
            <div className="space-y-2">
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
          <div className="space-y-8">
            {/* Statement Balance Matrix */}
            <Card>
              <CardHeader>
                <CardTitle>Statement Balances</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Account</TableHead>
                        <TableHead className="w-[80px]">Type</TableHead>
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
                          <TableCell className="font-medium">{account.name}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              account.type === 'Asset' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {account.type}
                            </span>
                          </TableCell>
                          {selectedMonths.map(monthValue => (
                            <TableCell key={`${account.name}-${monthValue}`} className="text-center">
                              <Input
                                type="number"
                                defaultValue={
                                  account.name === "Checking Account" ? "12345.67" :
                                  account.name === "Savings Account" ? "25890.12" :
                                  "2456.78"
                                }
                                className="w-28 text-center"
                                step="0.01"
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Interest Charged Matrix */}
            <Card>
              <CardHeader>
                <CardTitle>Interest Charged</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Account</TableHead>
                        <TableHead className="w-[80px]">Type</TableHead>
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
                          <TableCell className="font-medium">{account.name}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              account.type === 'Asset' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {account.type}
                            </span>
                          </TableCell>
                          {selectedMonths.map(monthValue => (
                            <TableCell key={`${account.name}-${monthValue}-interest`} className="text-center">
                              <Input
                                type="number"
                                defaultValue={
                                  account.name === "Checking Account" ? "0.00" :
                                  account.name === "Savings Account" ? "95.43" :
                                  "47.23"
                                }
                                className="w-28 text-center"
                                step="0.01"
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}


      </div>
    </AppShell>
  );
}
