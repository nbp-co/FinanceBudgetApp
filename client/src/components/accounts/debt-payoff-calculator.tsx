import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Account } from "@shared/schema";

interface DebtPayoffCalculatorProps {
  accounts: Account[];
}

export function DebtPayoffCalculator({ accounts }: DebtPayoffCalculatorProps) {
  const [balance, setBalance] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [minimumPayment, setMinimumPayment] = useState("");
  const [extraPayment, setExtraPayment] = useState("");
  const [results, setResults] = useState<{
    monthsToPayoff: number;
    totalInterest: number;
    totalPaid: number;
    monthsWithExtra: number;
    interestWithExtra: number;
    totalWithExtra: number;
    interestSaved: number;
    timeSaved: number;
  } | null>(null);

  const calculatePayoff = () => {
    const bal = parseFloat(balance) || 0;
    const rate = parseFloat(interestRate) || 0;
    const minPay = parseFloat(minimumPayment) || 0;
    const extraPay = parseFloat(extraPayment) || 0;

    if (bal <= 0 || rate < 0 || minPay <= 0) return;

    const monthlyRate = rate / 100 / 12;

    // Calculate minimum payment only
    let remainingBalance = bal;
    let months = 0;
    let totalInterest = 0;

    while (remainingBalance > 0 && months < 600) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = Math.min(minPay - interestPayment, remainingBalance);
      
      if (principalPayment <= 0) break;
      
      totalInterest += interestPayment;
      remainingBalance -= principalPayment;
      months++;
    }

    // Calculate with extra payment
    let remainingBalanceExtra = bal;
    let monthsExtra = 0;
    let totalInterestExtra = 0;
    const totalPaymentExtra = minPay + extraPay;

    while (remainingBalanceExtra > 0 && monthsExtra < 600) {
      const interestPayment = remainingBalanceExtra * monthlyRate;
      const principalPayment = Math.min(totalPaymentExtra - interestPayment, remainingBalanceExtra);
      
      if (principalPayment <= 0) break;
      
      totalInterestExtra += interestPayment;
      remainingBalanceExtra -= principalPayment;
      monthsExtra++;
    }

    setResults({
      monthsToPayoff: months,
      totalInterest,
      totalPaid: bal + totalInterest,
      monthsWithExtra: monthsExtra,
      interestWithExtra: totalInterestExtra,
      totalWithExtra: bal + totalInterestExtra,
      interestSaved: totalInterest - totalInterestExtra,
      timeSaved: months - monthsExtra
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calculator className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Debt Payoff Calculator</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Calculate Your Debt Payoff</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="balance">Current Balance</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">$</span>
                </div>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  min="0"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="pl-8"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="interest-rate">Annual Interest Rate (%)</Label>
              <Input
                id="interest-rate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="24.99"
              />
            </div>

            <div>
              <Label htmlFor="minimum-payment">Minimum Monthly Payment</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">$</span>
                </div>
                <Input
                  id="minimum-payment"
                  type="number"
                  step="0.01"
                  min="0"
                  value={minimumPayment}
                  onChange={(e) => setMinimumPayment(e.target.value)}
                  className="pl-8"
                  placeholder="0.00"
                />
              </div>
            </div>

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
          </div>

          <Button onClick={calculatePayoff} className="w-full">
            <Calculator className="h-4 w-4 mr-2" />
            Calculate Payoff Plan
          </Button>
        </CardContent>
      </Card>

      {results && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Minimum Payment Only</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Time to Pay Off</p>
                <p className="text-2xl font-bold">{results.monthsToPayoff} months</p>
                <p className="text-sm text-gray-500">{Math.floor(results.monthsToPayoff / 12)} years {results.monthsToPayoff % 12} months</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Interest Paid</p>
                <p className="text-xl font-semibold text-red-600">{formatCurrency(results.totalInterest)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount Paid</p>
                <p className="text-xl font-semibold">{formatCurrency(results.totalPaid)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">With Extra Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Time to Pay Off</p>
                <p className="text-2xl font-bold">{results.monthsWithExtra} months</p>
                <p className="text-sm text-gray-500">{Math.floor(results.monthsWithExtra / 12)} years {results.monthsWithExtra % 12} months</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Interest Paid</p>
                <p className="text-xl font-semibold text-red-600">{formatCurrency(results.interestWithExtra)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount Paid</p>
                <p className="text-xl font-semibold">{formatCurrency(results.totalWithExtra)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {results && results.timeSaved > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-lg text-green-800">Savings Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-green-700">Interest Saved</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(results.interestSaved)}</p>
              </div>
              <div>
                <p className="text-sm text-green-700">Time Saved</p>
                <p className="text-2xl font-bold text-green-600">{results.timeSaved} months</p>
                <p className="text-sm text-green-600">{Math.floor(results.timeSaved / 12)} years {results.timeSaved % 12} months</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}