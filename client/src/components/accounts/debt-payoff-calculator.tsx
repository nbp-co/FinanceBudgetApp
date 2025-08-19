import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Calculator, CreditCard, Calendar, DollarSign, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Account } from "@shared/schema";

interface DebtPayoffCalculatorProps {
  accounts: Account[];
}

interface DebtPayoffPlan {
  accountName: string;
  currentBalance: number;
  minimumPayment: number;
  apr: number;
  monthsToPayoff: number;
  totalInterest: number;
  totalPaid: number;
}

export function DebtPayoffCalculator({ accounts }: DebtPayoffCalculatorProps) {
  const [extraPayment, setExtraPayment] = useState("");
  const [strategy, setStrategy] = useState<"avalanche" | "snowball">("avalanche");
  const [calculations, setCalculations] = useState<DebtPayoffPlan[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Filter debt accounts
  const debtAccounts = accounts.filter(account => account.type === 'DEBT');

  const calculatePayoffPlan = () => {
    if (debtAccounts.length === 0) return;

    const extra = parseFloat(extraPayment) || 0;
    const plans: DebtPayoffPlan[] = [];

    debtAccounts.forEach(account => {
      const balance = parseFloat(account.openingBalance) || 0;
      const apr = account.aprApy || 24.99; // Default credit card rate
      const monthlyRate = apr / 100 / 12;
      
      // Estimate minimum payment (2% of balance or $25, whichever is higher)
      const minimumPayment = Math.max(balance * 0.02, 25);
      
      // Calculate with extra payment distributed evenly
      const totalPayment = minimumPayment + (extra / debtAccounts.length);
      
      let remainingBalance = balance;
      let months = 0;
      let totalInterestPaid = 0;
      
      while (remainingBalance > 0 && months < 600) { // Max 50 years
        const interestPayment = remainingBalance * monthlyRate;
        const principalPayment = Math.min(totalPayment - interestPayment, remainingBalance);
        
        if (principalPayment <= 0) break; // Payment too low to cover interest
        
        totalInterestPaid += interestPayment;
        remainingBalance -= principalPayment;
        months++;
      }

      plans.push({
        accountName: account.name,
        currentBalance: balance,
        minimumPayment,
        apr,
        monthsToPayoff: months,
        totalInterest: totalInterestPaid,
        totalPaid: balance + totalInterestPaid
      });
    });

    // Sort by strategy
    if (strategy === "avalanche") {
      plans.sort((a, b) => b.apr - a.apr); // Highest interest first
    } else {
      plans.sort((a, b) => a.currentBalance - b.currentBalance); // Lowest balance first
    }

    setCalculations(plans);
    setShowResults(true);
  };

  const totalDebt = debtAccounts.reduce((sum, account) => sum + parseFloat(account.openingBalance || "0"), 0);
  const totalInterest = calculations.reduce((sum, plan) => sum + plan.totalInterest, 0);
  const averageMonths = calculations.length > 0 ? Math.round(calculations.reduce((sum, plan) => sum + plan.monthsToPayoff, 0) / calculations.length) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Calculator className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Debt Payoff Calculator</h2>
      </div>

      {debtAccounts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No debt accounts found. Add a credit card or loan account to use the debt payoff calculator.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Current Debt Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Debt</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-red-500" />
                  <span className="text-2xl font-bold text-red-600">{formatCurrency(totalDebt)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Debt Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-500" />
                  <span className="text-2xl font-bold">{debtAccounts.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Est. Interest Saved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-green-500" />
                  <span className="text-2xl font-bold text-green-600">
                    {showResults ? formatCurrency(totalInterest * 0.3) : "--"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Calculator Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Payoff Strategy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="extra-payment">Extra Monthly Payment</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm">$</span>
                    </div>
                    <Input
                      id="extra-payment"
                      type="number"
                      step="0.01"
                      min="0"
                      value={extraPayment}
                      onChange={(e) => setExtraPayment(e.target.value)}
                      className="pl-8"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="strategy">Payoff Strategy</Label>
                  <Select value={strategy} onValueChange={(value: "avalanche" | "snowball") => setStrategy(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="avalanche">Debt Avalanche (Highest Interest First)</SelectItem>
                      <SelectItem value="snowball">Debt Snowball (Lowest Balance First)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={calculatePayoffPlan} className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Payoff Plan
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {showResults && calculations.length > 0 && (
            <>
              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Payoff Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Average Time to Payoff</p>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span className="text-xl font-bold">{averageMonths} months</span>
                      </div>
                      <p className="text-xs text-gray-500">{Math.round(averageMonths / 12)} years {averageMonths % 12} months</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Total Interest</p>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <DollarSign className="h-4 w-4 text-red-500" />
                        <span className="text-xl font-bold text-red-600">{formatCurrency(totalInterest)}</span>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Total Paid</p>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <DollarSign className="h-4 w-4 text-gray-700" />
                        <span className="text-xl font-bold">{formatCurrency(totalDebt + totalInterest)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Plan */}
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Payoff Plan</CardTitle>
                  <p className="text-sm text-gray-600">
                    Strategy: {strategy === "avalanche" ? "Debt Avalanche (pay highest interest first)" : "Debt Snowball (pay lowest balance first)"}
                  </p>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Account</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>APR</TableHead>
                        <TableHead>Min Payment</TableHead>
                        <TableHead>Payoff Time</TableHead>
                        <TableHead>Interest Paid</TableHead>
                        <TableHead>Progress</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {calculations.map((plan, index) => (
                        <TableRow key={plan.accountName}>
                          <TableCell className="font-medium">{plan.accountName}</TableCell>
                          <TableCell className="text-red-600 font-semibold">
                            {formatCurrency(plan.currentBalance)}
                          </TableCell>
                          <TableCell>{plan.apr.toFixed(2)}%</TableCell>
                          <TableCell>{formatCurrency(plan.minimumPayment)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              {plan.monthsToPayoff} months
                            </div>
                          </TableCell>
                          <TableCell className="text-red-600">
                            {formatCurrency(plan.totalInterest)}
                          </TableCell>
                          <TableCell>
                            <div className="w-full">
                              <Progress 
                                value={Math.max(10, 100 - (plan.monthsToPayoff / 60) * 100)} 
                                className="h-2" 
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                {Math.round(plan.monthsToPayoff / 12)} years
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Debt Payoff Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-blue-600 mb-2">Debt Avalanche Strategy</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Pay minimums on all debts</li>
                    <li>• Put extra money toward highest interest debt</li>
                    <li>• Mathematically optimal (saves most money)</li>
                    <li>• May take longer to see progress</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-green-600 mb-2">Debt Snowball Strategy</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Pay minimums on all debts</li>
                    <li>• Put extra money toward smallest balance</li>
                    <li>• Quick wins build momentum</li>
                    <li>• May cost more in interest long-term</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}