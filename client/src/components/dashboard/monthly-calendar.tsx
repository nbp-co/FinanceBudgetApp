import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, getDay, isSameDay } from "date-fns";
import { formatCurrency, formatCurrencyWhole } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import type { Account, Transaction } from "@shared/schema";

interface MonthlyCalendarProps {
  onDateSelect?: (date: Date | null) => void;
}

export function MonthlyCalendar({ onDateSelect }: MonthlyCalendarProps = {}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("all");
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Fetch user accounts
  const { data: accounts = [], isLoading: accountsLoading } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  // Fetch transactions for the current month
  const { data: transactions = [], isLoading: transactionsLoading, refetch: refetchTransactions } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions", selectedAccountId, monthStart.toISOString(), monthEnd.toISOString()],
    queryFn: () => {
      const params = new URLSearchParams({
        startDate: monthStart.toISOString(),
        endDate: monthEnd.toISOString(),
      });
      
      if (selectedAccountId !== "all") {
        params.append("accountId", selectedAccountId);
      }
      
      return fetch(`/api/transactions?${params.toString()}`, {
        credentials: "include",
      }).then(res => res.json());
    },
  });

  // Reset selected date when month changes
  useEffect(() => {
    setSelectedDate(null);
    onDateSelect?.(null);
  }, [currentDate, onDateSelect]);

  // Update parent when selected date changes
  useEffect(() => {
    onDateSelect?.(selectedDate);
  }, [selectedDate, onDateSelect]);

  // Reset selected date when account changes to avoid confusion
  useEffect(() => {
    setSelectedDate(null);
    onDateSelect?.(null);
  }, [selectedAccountId, onDateSelect]);
  
  // Get days from previous month to fill the grid
  const startPadding = getDay(monthStart);
  const previousMonthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth(), 0);
  const paddingDays = Array.from({ length: startPadding }, (_, i) => 
    new Date(previousMonthEnd.getFullYear(), previousMonthEnd.getMonth(), previousMonthEnd.getDate() - startPadding + i + 1)
  );
  
  // Create initial grid with current month days and minimal padding
  const initialDays = [...paddingDays, ...daysInMonth];
  
  // Calculate how many complete weeks we need
  const weeksNeeded = Math.ceil(initialDays.length / 7);
  const totalCells = weeksNeeded * 7;
  const remainingCells = totalCells - initialDays.length;
  
  // Only add next month days if needed to complete the current weeks
  const nextMonthDays = remainingCells > 0 
    ? Array.from({ length: remainingCells }, (_, i) => 
        new Date(monthEnd.getFullYear(), monthEnd.getMonth() + 1, i + 1)
      )
    : [];
  
  const allDays = [...initialDays, ...nextMonthDays];
  
  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Group transactions by date for efficient lookup
  const transactionsByDate = useMemo(() => {
    const grouped: Record<string, Transaction[]> = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const dateKey = format(date, 'yyyy-MM-dd');
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(transaction);
    });
    
    return grouped;
  }, [transactions]);

  // Get transactions for a specific day
  const getTransactionsForDay = (date: Date): Transaction[] => {
    if (!isSameMonth(date, currentDate)) return [];
    
    const dateKey = format(date, 'yyyy-MM-dd');
    return transactionsByDate[dateKey] || [];
  };

  // Calculate running balance up to a given date
  const getDailyBalance = (date: Date): number => {
    const daysToCalculate = eachDayOfInterval({ start: monthStart, end: date });
    
    let runningBalance = 0;
    
    for (const day of daysToCalculate) {
      const dayTransactions = getTransactionsForDay(day);
      for (const transaction of dayTransactions) {
        const amount = parseFloat(transaction.amount);
        
        if (transaction.type === 'INCOME') {
          runningBalance += amount;
        } else if (transaction.type === 'EXPENSE') {
          runningBalance -= amount;
        }
        // TRANSFER transactions don't affect total balance in this view
      }
    }
    
    return runningBalance;
  };

  const handleDayClick = (day: Date) => {
    if (isSameMonth(day, currentDate)) {
      setSelectedDate(day);
    }
  };

  const selectedDayTransactions = selectedDate ? getTransactionsForDay(selectedDate) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="icon" onClick={goToPrevMonth} disabled={transactionsLoading}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-3">
                <CardTitle className="text-xl">{format(currentDate, 'MMMM yyyy').toUpperCase()}</CardTitle>
                <Button variant="ghost" size="sm" onClick={goToToday} className="h-6 w-6 p-0" disabled={transactionsLoading}>
                  <Calendar className="h-3 w-3" />
                </Button>
              </div>
              <Button variant="ghost" size="icon" onClick={goToNextMonth} disabled={transactionsLoading}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Account Selection */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Account:</span>
              <Select
                value={selectedAccountId}
                onValueChange={setSelectedAccountId}
                disabled={accountsLoading}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select account..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
      <CardContent>
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day Headers */}
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
            <div key={day} className="text-center p-2 text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
          
          {/* Calendar Days */}
          {allDays.map((day, index) => {
            const transactions = getTransactionsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isTodayDate = isToday(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            
            return (
              <div
                key={index}
                onClick={() => handleDayClick(day)}
                className={`h-16 border rounded-lg p-1 cursor-pointer transition-colors hover:bg-gray-50 ${
                  !isCurrentMonth ? 'cursor-not-allowed' : ''
                } ${
                  isSelected || isTodayDate
                    ? 'border-primary/30' 
                    : 'border-gray-100'
                }`}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-center">
                    <div className={`text-sm font-medium flex items-center justify-center w-6 h-6 ${
                      isSelected
                        ? 'bg-primary text-white rounded-full'
                        : isTodayDate 
                          ? 'text-primary font-bold' 
                          : isCurrentMonth
                            ? 'text-gray-900'
                            : 'text-gray-400'
                    }`}>
                      {format(day, 'd')}
                    </div>
                  </div>
                  <div className="flex gap-1 justify-center mt-1">
                    {transactions.slice(0, 2).map((transaction, txIndex) => {
                      if (transaction.type === 'INCOME') {
                        return (
                          <div key={txIndex} className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                        );
                      } else if (transaction.type === 'EXPENSE') {
                        return (
                          <div key={txIndex} className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                        );
                      } else if (transaction.type === 'TRANSFER') {
                        // Split transfer dot: left half blue (base), right half green/red (direction)
                        return (
                          <div key={txIndex} className="w-1.5 h-1.5 rounded-full overflow-hidden flex">
                            <div className="w-1/2 h-full bg-blue-400"></div>
                            <div className="w-1/2 h-full bg-gray-400"></div>
                          </div>
                        );
                      }
                      return null;
                    })}
                    {transactions.length > 2 && (
                      <div className="text-xs text-gray-400">+</div>
                    )}
                  </div>
                  {/* Show ending balance for days with transactions */}
                  {transactions.length > 0 && isCurrentMonth && (
                    <div className="mt-auto">
                      <div className={`text-[10px] text-center font-medium px-1 leading-3 ${
                        getDailyBalance(day) < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {getDailyBalance(day) < 0 
                          ? `-${Math.abs(Math.round(getDailyBalance(day))).toLocaleString()}`
                          : Math.round(getDailyBalance(day)).toLocaleString()
                        }
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Balance Bar for Selected Day */}
        {selectedDate && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Balance for {format(selectedDate, 'EEEE, MMM d')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary">
                  {transactionsLoading ? "Loading..." : formatCurrency(getDailyBalance(selectedDate))}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {transactionsLoading && (
          <div className="mt-4 text-center text-sm text-gray-500">
            Loading transactions...
          </div>
        )}
      </CardContent>
    </Card>
  </div>

  {/* Transaction List for Selected Day */}
  <div className="lg:col-span-1">
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {selectedDate ? format(selectedDate, 'EEEE, MMM d') : 'Select a day'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactionsLoading ? (
          <div className="text-center py-8 text-sm text-gray-500">Loading...</div>
        ) : selectedDayTransactions.length > 0 ? (
          <div className="space-y-3">
            {selectedDayTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {transaction.type === 'TRANSFER' ? (
                    <div className="w-3 h-3 rounded-full overflow-hidden flex">
                      <div className="w-1/2 h-full bg-blue-400"></div>
                      <div className={`w-1/2 h-full ${
                        ((transaction as any).toAccount === 'Checking' || (transaction as any).toAccount === 'Savings') 
                          ? 'bg-green-400' : 'bg-red-400'
                      }`}></div>
                    </div>
                  ) : (
                    <div className={`w-3 h-3 rounded-full ${
                      transaction.type === 'INCOME' ? 'bg-green-400' : 'bg-red-400'
                    }`} />
                  )}
                  <div>
                    <p className="font-medium text-sm text-gray-900">{transaction.description}</p>
                    <p className="text-xs text-gray-500">{transaction.categoryId ? 'Categorized' : 'Uncategorized'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold text-sm ${
                    transaction.type === 'INCOME' ? 'text-green-600' :
                    transaction.type === 'EXPENSE' ? 'text-red-600' : 'text-gray-800'
                  }`}>
                    {transaction.type === 'INCOME' ? '+' : transaction.type === 'EXPENSE' ? '-' : ''}
                    {formatCurrency(parseFloat(transaction.amount))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">
              {selectedDate ? 'No transactions on this day' : 'Click on a day to view transactions'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  </div>
</div>
  );
}
