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
  const [selectedMonths, setSelectedMonths] = useState<string[]>(["2024-11"]);
  const availableMonths = [
    { value: "2024-12", label: "December 2024" },
    { value: "2024-11", label: "November 2024" },
    { value: "2024-10", label: "October 2024" },
    { value: "2024-09", label: "September 2024" },
    { value: "2024-08", label: "August 2024" },
    { value: "2024-07", label: "July 2024" },
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
          <div className="space-y-6">
            {selectedMonths.map((monthValue) => {
              const monthLabel = availableMonths.find(m => m.value === monthValue)?.label || monthValue;
              return (
                <Card key={monthValue}>
                  <CardHeader>
                    <CardTitle>{monthLabel} Statements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Account</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Statement Balance</TableHead>
                          <TableHead>Interest Charged</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Checking Account</TableCell>
                          <TableCell>Asset</TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              defaultValue="12345.67" 
                              className="w-32"
                              step="0.01"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              defaultValue="0.00" 
                              className="w-28"
                              step="0.01"
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Savings Account</TableCell>
                          <TableCell>Asset</TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              defaultValue="25890.12" 
                              className="w-32"
                              step="0.01"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              defaultValue="95.43" 
                              className="w-28"
                              step="0.01"
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Credit Card</TableCell>
                          <TableCell>Debt</TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              defaultValue="2456.78" 
                              className="w-32"
                              step="0.01"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              defaultValue="47.23" 
                              className="w-28"
                              step="0.01"
                            />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}


      </div>
    </AppShell>
  );
}
