import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, TrendingUp, TrendingDown, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addWeeks, addMonths, subWeeks, subMonths } from "date-fns";

interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: "income" | "expense" | "transfer";
  date: Date;
  account: string;
}

// Mock data for demonstration
const mockTransactions: Transaction[] = [
  {
    id: "1",
    amount: -85.00,
    description: "Coffee & Lunch",
    category: "Food",
    type: "expense",
    date: new Date(2025, 7, 11),
    account: "Checking"
  },
  {
    id: "2",
    amount: -45.00,
    description: "Gas Station",
    category: "Transportation",
    type: "expense",
    date: new Date(2025, 7, 10),
    account: "Checking"
  },
  {
    id: "3",
    amount: 2500.00,
    description: "Salary",
    category: "Income",
    type: "income",
    date: new Date(2025, 7, 8),
    account: "Checking"
  },
  {
    id: "4",
    amount: -120.00,
    description: "Grocery Store",
    category: "Food",
    type: "expense",
    date: new Date(2025, 7, 7),
    account: "Checking"
  },
  {
    id: "5",
    amount: -75.00,
    description: "Internet Bill",
    category: "Utilities",
    type: "expense",
    date: new Date(2025, 7, 5),
    account: "Checking"
  }
];

export function TransactionPeriodView() {
  const [viewType, setViewType] = useState<"week" | "month">("month");
  const [currentDate, setCurrentDate] = useState(new Date());

  const getPeriodDates = () => {
    if (viewType === "week") {
      return {
        start: startOfWeek(currentDate, { weekStartsOn: 1 }),
        end: endOfWeek(currentDate, { weekStartsOn: 1 })
      };
    } else {
      return {
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate)
      };
    }
  };

  const navigatePeriod = (direction: "prev" | "next") => {
    if (viewType === "week") {
      setCurrentDate(direction === "next" ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
    } else {
      setCurrentDate(direction === "next" ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
    }
  };

  const { start, end } = getPeriodDates();
  
  // Filter transactions for the current period
  const periodTransactions = mockTransactions.filter(transaction => 
    transaction.date >= start && transaction.date <= end
  );

  // Calculate totals
  const totals = periodTransactions.reduce(
    (acc, transaction) => {
      if (transaction.type === "income") {
        acc.income += transaction.amount;
      } else if (transaction.type === "expense") {
        acc.expenses += Math.abs(transaction.amount);
      }
      return acc;
    },
    { income: 0, expenses: 0 }
  );

  const netAmount = totals.income - totals.expenses;

  const formatPeriodTitle = () => {
    if (viewType === "week") {
      return `Week of ${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
    } else {
      return format(start, "MMMM yyyy");
    }
  };

  return (
    <div className="space-y-6">
      {/* Period Navigation Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Select value={viewType} onValueChange={(value: "week" | "month") => setViewType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={() => navigatePeriod("prev")}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="text-lg font-semibold min-w-[200px] text-center">
                  {formatPeriodTitle()}
                </h3>
                <Button variant="outline" size="icon" onClick={() => navigatePeriod("next")}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Period Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Income</p>
                <p className="text-2xl font-bold text-green-600">${totals.income.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expenses</p>
                <p className="text-2xl font-bold text-red-600">${totals.expenses.toFixed(2)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Net</p>
                <p className={`text-2xl font-bold ${netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${netAmount.toFixed(2)}
                </p>
              </div>
              <ArrowUpDown className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Transactions ({periodTransactions.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {periodTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No transactions found for this period
            </div>
          ) : (
            <div className="space-y-3">
              {periodTransactions
                .sort((a, b) => b.date.getTime() - a.date.getTime())
                .map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`h-2 w-2 rounded-full ${
                        transaction.type === "income" ? "bg-green-500" : 
                        transaction.type === "expense" ? "bg-red-500" : "bg-blue-500"
                      }`} />
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span>{format(transaction.date, "MMM d, yyyy")}</span>
                          <Badge variant="secondary" className="text-xs">
                            {transaction.category}
                          </Badge>
                          <span>•</span>
                          <span>{transaction.account}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        transaction.type === "income" ? "text-green-600" : "text-red-600"
                      }`}>
                        {transaction.type === "income" ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}