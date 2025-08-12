import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, ArrowDown, ArrowUp } from "lucide-react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addWeeks, addMonths, subWeeks, subMonths } from "date-fns";
import { formatCurrency, formatCurrencyWhole } from "@/lib/utils";

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

interface TransactionPeriodViewProps {
  accountFilter?: string;
  onAccountFilterChange?: (value: string) => void;
}

export function TransactionPeriodView({ accountFilter = "all", onAccountFilterChange }: TransactionPeriodViewProps) {
  const [viewType, setViewType] = useState<"week" | "month">("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

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
      return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
    } else {
      return format(start, "MMMM yyyy");
    }
  };

  return (
    <div className="space-y-6">
      {/* Combined Section */}
      <Card>
        {/* Navigation Header */}
        <CardHeader className="pb-3 pt-3">
          {/* Mobile Layout - Stack vertically */}
          <div className="flex flex-col space-y-3 sm:hidden">
            {/* Top row: Account dropdown and Week/Month toggle */}
            <div className="flex items-center justify-between">
              <Select value={accountFilter} onValueChange={onAccountFilterChange}>
                <SelectTrigger className="w-32 h-8">
                  <SelectValue placeholder="All Accounts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  <SelectItem value="assets">Assets Only</SelectItem>
                  <SelectItem value="debts">Debts Only</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center space-x-1 bg-gray-100 rounded-md p-1">
                <button
                  onClick={() => setViewType("week")}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    viewType === "week" 
                      ? "bg-white text-gray-900 shadow-sm" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setViewType("month")}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    viewType === "month" 
                      ? "bg-white text-gray-900 shadow-sm" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Month
                </button>
              </div>
            </div>
            
            {/* Bottom row: Month navigation centered */}
            <div className="flex items-center justify-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigatePeriod("prev")}>
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <h3 className="text-base font-semibold min-w-[180px] text-center">
                {formatPeriodTitle()}
              </h3>
              <Button variant="outline" size="sm" onClick={() => navigatePeriod("next")}>
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Desktop Layout - Keep horizontal */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Select value={accountFilter} onValueChange={onAccountFilterChange}>
                <SelectTrigger className="w-32 h-8">
                  <SelectValue placeholder="All Accounts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  <SelectItem value="assets">Assets Only</SelectItem>
                  <SelectItem value="debts">Debts Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigatePeriod("prev")}>
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <h3 className="text-base font-semibold min-w-[180px] text-center">
                {formatPeriodTitle()}
              </h3>
              <Button variant="outline" size="sm" onClick={() => navigatePeriod("next")}>
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-1 bg-gray-100 rounded-md p-1">
              <button
                onClick={() => setViewType("week")}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  viewType === "week" 
                    ? "bg-white text-gray-900 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewType("month")}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  viewType === "month" 
                    ? "bg-white text-gray-900 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                Month
              </button>
            </div>
          </div>
        </CardHeader>

        {/* Period Summary Cards */}
        <CardContent className="px-6 py-4 border-b">
          <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-2xl mx-auto">
            <div className="p-3 rounded-lg bg-white border border-gray-200 shadow-sm text-center">
              <p className="text-xs font-medium text-gray-600 truncate">Income</p>
              <p className="text-lg sm:text-xl font-bold text-green-600">{formatCurrencyWhole(totals.income)}</p>
            </div>

            <div className="p-3 rounded-lg bg-white border border-gray-200 shadow-sm text-center">
              <p className="text-xs font-medium text-gray-600 truncate">Expenses</p>
              <p className="text-lg sm:text-xl font-bold text-red-600">{formatCurrencyWhole(totals.expenses)}</p>
            </div>

            <div className="p-3 rounded-lg bg-white border border-gray-200 shadow-sm text-center">
              <p className="text-xs font-medium text-gray-600 truncate">Net</p>
              <p className={`text-lg sm:text-xl font-bold ${netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrencyWhole(netAmount)}
              </p>
            </div>
          </div>
        </CardContent>

        {/* Transactions List Header */}
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Transactions ({periodTransactions.length})</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
              className="flex items-center space-x-1 text-sm"
            >
              <span>Sort</span>
              {sortOrder === "desc" ? (
                <ArrowDown className="h-3 w-3" />
              ) : (
                <ArrowUp className="h-3 w-3" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {periodTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No transactions found for this period
            </div>
          ) : (
            <div className="space-y-3">
              {periodTransactions
                .sort((a, b) => {
                  const dateA = a.date.getTime();
                  const dateB = b.date.getTime();
                  return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
                })
                .map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      {transaction.type === "transfer" ? (
                        <div className="h-2 w-2 rounded-full overflow-hidden flex">
                          <div className="w-1/2 h-full bg-red-500"></div>
                          <div className="w-1/2 h-full bg-green-500"></div>
                        </div>
                      ) : (
                        <div className={`h-2 w-2 rounded-full ${
                          transaction.type === "income" ? "bg-green-500" : "bg-red-500"
                        }`} />
                      )}
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span>{format(transaction.date, "MMM d, yyyy")}</span>
                          <span>•</span>
                          <span>{transaction.account}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        transaction.type === "income" ? "text-green-600" : 
                        transaction.type === "expense" ? "text-red-600" : "text-gray-800"
                      }`}>
                        {transaction.type === "income" ? "+" : transaction.type === "expense" ? "-" : ""}{formatCurrency(Math.abs(transaction.amount))}
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