import { AppShell } from "@/components/layout/app-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountList } from "@/components/accounts/account-list";
import { DebtPayoffCalculator } from "@/components/accounts/debt-payoff-calculator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { Account } from "@shared/schema";

function StatementsContent() {
  const [selectedMonths, setSelectedMonths] = useState([
    'JAN 2025', 'FEB 2025', 'MAR 2025'
  ]);
  
  const months = [
    'JAN 2025', 'FEB 2025', 'MAR 2025', 'APR 2025',
    'JUL 2025', 'AUG 2025', 'SEP 2025', 'OCT 2025'
  ];

  const toggleMonth = (month: string) => {
    setSelectedMonths(prev => 
      prev.includes(month) 
        ? prev.filter(m => m !== month)
        : [...prev, month]
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Monthly Statements</h2>
      
      {/* Month Selection */}
      <div>
        <p className="text-sm text-gray-600 mb-4">Select months to edit:</p>
        <div className="grid grid-cols-4 gap-4">
          {months.map((month) => (
            <div key={month} className="flex items-center space-x-2">
              <Checkbox
                id={month}
                checked={selectedMonths.includes(month)}
                onCheckedChange={() => toggleMonth(month)}
              />
              <label htmlFor={month} className="text-sm font-medium">
                {month}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Sort */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Filter:</label>
          <Select defaultValue="all-types">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-types">All Types</SelectItem>
              <SelectItem value="asset">Asset</SelectItem>
              <SelectItem value="debt">Debt</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Sort:</label>
          <Select defaultValue="type-desc">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="type-desc">Type (Desc)</SelectItem>
              <SelectItem value="type-asc">Type (Asc)</SelectItem>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Statement Details */}
      <Card>
        <CardHeader>
          <CardTitle>Statement Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 bg-gray-50">ACCOUNT</th>
                  <th className="text-center p-3 bg-gray-100">AUG 2025</th>
                  <th className="text-center p-3 bg-gray-50">MAR 2025</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3">
                    <div>
                      <div className="font-medium">Auto Loan</div>
                      <div className="text-sm text-blue-600">Debt</div>
                      <div className="text-sm text-gray-500">Auto Loan</div>
                      <div className="text-xs text-gray-400">Due: APR 10th 5.21%</div>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <div className="font-semibold">$ 18,450.00</div>
                    <div className="text-sm text-gray-500">$ 78.95</div>
                  </td>
                  <td className="p-3 text-center">
                    <div className="font-semibold">$ 18,999.00</div>
                    <div className="text-sm text-gray-500">$ 82.13</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AccountsPage() {
  // Fetch accounts for debt payoff calculator
  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Accounts</h1>
        </div>
        
        <Tabs defaultValue="accounts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="accounts">My Accounts</TabsTrigger>
            <TabsTrigger value="statements">Statements</TabsTrigger>
            <TabsTrigger value="debt-payoff">Debt Payoff</TabsTrigger>
          </TabsList>
          
          <TabsContent value="accounts" className="space-y-6">
            <AccountList />
          </TabsContent>
          
          <TabsContent value="statements" className="space-y-6">
            <StatementsContent />
          </TabsContent>
          
          <TabsContent value="debt-payoff" className="space-y-6">
            <DebtPayoffCalculator accounts={accounts} />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}