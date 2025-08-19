import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, getDay, isSameDay } from "date-fns";
import { formatCurrency, formatCurrencyWhole } from "@/lib/utils";

export function MonthlyCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [accountFilter, setAccountFilter] = useState("assets");
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
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

  // Mock starting balance - would come from API
  const startingBalance = 12345.67;

  // Mock transaction data - would come from API
  const getTransactionsForDay = (date: Date) => {
    const dayOfMonth = date.getDate();
    if (!isSameMonth(date, currentDate)) return [];
    
    // Mock some transactions with more detail
    if (dayOfMonth === 1) return [
      { id: '1', type: 'income', amount: 4500, description: 'Salary Deposit', category: 'Salary' }
    ];
    if (dayOfMonth === 3) return [
      { id: '2', type: 'expense', amount: 127, description: 'Grocery Shopping', category: 'Groceries' },
      { id: '3', type: 'income', amount: 50, description: 'Freelance Payment', category: 'Freelance' }
    ];
    if (dayOfMonth === 5) return [
      { id: '4', type: 'transfer', amount: 5000, description: 'Transfer to Savings', category: 'Transfer', fromAccount: 'Checking', toAccount: 'Savings' },
      { id: '5', type: 'transfer', amount: 3000, description: 'Investment Transfer', category: 'Transfer', fromAccount: 'Savings', toAccount: 'Investment' },
      { id: '6', type: 'transfer', amount: 2500, description: 'Credit Payment', category: 'Transfer', fromAccount: 'Checking', toAccount: 'Credit Card' },
      { id: '7', type: 'transfer', amount: 6269, description: 'Business Transfer', category: 'Transfer', fromAccount: 'Business', toAccount: 'Checking' }
    ];
    if (dayOfMonth === 10) return [
      { id: '5', type: 'income', amount: 500, description: 'Investment Dividend', category: 'Investment' },
      { id: '6', type: 'expense', amount: 200, description: 'Utility Bill', category: 'Utilities' },
      { id: '7', type: 'transfer', amount: 300, description: 'Credit Card Payment', category: 'Transfer', fromAccount: 'Checking', toAccount: 'Credit Card' }
    ];
    if (isToday(date)) return [
      { id: '8', type: 'expense', amount: 85, description: 'Coffee & Lunch', category: 'Food' },
      { id: '9', type: 'expense', amount: 45, description: 'Gas Station', category: 'Transportation' }
    ];
    return [];
  };

  // Calculate daily balance for a given date
  const getDailyBalance = (date: Date) => {
    let balance = startingBalance;
    const monthStart = startOfMonth(currentDate);
    
    // Calculate balance from start of month to the given date
    const daysToCalculate = eachDayOfInterval({ start: monthStart, end: date });
    
    for (const day of daysToCalculate) {
      const transactions = getTransactionsForDay(day);
      for (const transaction of transactions) {
        if (transaction.type === 'income') {
          balance += transaction.amount;
        } else if (transaction.type === 'expense') {
          balance -= transaction.amount;
        }
        // Transfer transactions don't affect the total balance in this simplified example
      }
    }
    
    return balance;
  };

  const getFilteredTransactions = (transactions: any[]) => {
    if (accountFilter === "assets") {
      return transactions.filter(t => 
        ['Checking', 'Savings', 'Investment'].includes((t as any).fromAccount) ||
        ['Checking', 'Savings', 'Investment'].includes((t as any).toAccount) ||
        (t.type === 'income' || t.type === 'expense')
      );
    }
    if (accountFilter === "debts") {
      return transactions.filter(t => 
        ['Credit Card', 'Business Credit Card'].includes((t as any).fromAccount) ||
        ['Credit Card', 'Business Credit Card'].includes((t as any).toAccount)
      );
    }
    // Individual account filters
    if (accountFilter === "checking") {
      return transactions.filter(t => 
        (t as any).fromAccount === 'Checking' || 
        (t as any).toAccount === 'Checking' ||
        (t.type === 'income' || t.type === 'expense') // Income/expense typically go to checking
      );
    }
    if (accountFilter === "savings") {
      return transactions.filter(t => 
        (t as any).fromAccount === 'Savings' || 
        (t as any).toAccount === 'Savings'
      );
    }
    if (accountFilter === "investment") {
      return transactions.filter(t => 
        (t as any).fromAccount === 'Investment' || 
        (t as any).toAccount === 'Investment'
      );
    }
    if (accountFilter === "credit") {
      return transactions.filter(t => 
        (t as any).fromAccount === 'Credit Card' || 
        (t as any).toAccount === 'Credit Card'
      );
    }
    if (accountFilter === "business") {
      return transactions.filter(t => 
        (t as any).fromAccount === 'Business' || 
        (t as any).toAccount === 'Business'
      );
    }
    if (accountFilter === "business-credit") {
      return transactions.filter(t => 
        (t as any).fromAccount === 'Business Credit Card' || 
        (t as any).toAccount === 'Business Credit Card'
      );
    }
    return transactions;
  };

  const handleDayClick = (day: Date) => {
    if (isSameMonth(day, currentDate)) {
      setSelectedDate(day);
    }
  };

  const selectedDayTransactions = selectedDate ? getFilteredTransactions(getTransactionsForDay(selectedDate)) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-2">
        <Card>
          {/* Account Selector */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium text-gray-700">Account:</label>
                <Select value={accountFilter} onValueChange={setAccountFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select Account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assets">All Assets</SelectItem>
                    <SelectItem value="checking" className="pl-6">Checking Account</SelectItem>
                    <SelectItem value="savings" className="pl-6">Savings Account</SelectItem>
                    <SelectItem value="investment" className="pl-6">Investment Account</SelectItem>
                    <SelectItem value="business" className="pl-6">Business Account</SelectItem>
                    <SelectItem value="debts">All Debts</SelectItem>
                    <SelectItem value="credit" className="pl-6">Credit Card</SelectItem>
                    <SelectItem value="business-credit" className="pl-6">Business Credit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={goToPrevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-3">
                <CardTitle className="text-xl">{format(currentDate, 'MMMM yyyy').toUpperCase()}</CardTitle>
                <Button variant="ghost" size="sm" onClick={goToToday} className="h-6 w-6 p-0">
                  <Calendar className="h-3 w-3" />
                </Button>
              </div>
              <Button variant="ghost" size="icon" onClick={goToNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
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
            const allTransactions = getTransactionsForDay(day);
            const transactions = getFilteredTransactions(allTransactions);
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
                      if (transaction.type === 'income') {
                        return (
                          <div key={txIndex} className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                        );
                      } else if (transaction.type === 'expense') {
                        return (
                          <div key={txIndex} className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                        );
                      } else if (transaction.type === 'transfer') {
                        // Split transfer dot: left half blue (base), right half green/red (direction)
                        // Blue/Green for incoming transfers, Blue/Red for outgoing transfers
                        const toAccount = (transaction as any).toAccount;
                        const isIncoming = toAccount === 'Checking' || toAccount === 'Savings';
                        return (
                          <div key={txIndex} className="w-1.5 h-1.5 rounded-full overflow-hidden flex">
                            <div className="w-1/2 h-full bg-blue-400"></div>
                            <div className={`w-1/2 h-full ${isIncoming ? 'bg-green-400' : 'bg-red-400'}`}></div>
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
                  {formatCurrency(getDailyBalance(selectedDate))}
                </p>
              </div>
            </div>
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
        {selectedDayTransactions.length > 0 ? (
          <div className="space-y-3">
            {selectedDayTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {transaction.type === 'transfer' ? (
                    <div className="w-3 h-3 rounded-full overflow-hidden flex">
                      <div className="w-1/2 h-full bg-blue-400"></div>
                      <div className={`w-1/2 h-full ${
                        ((transaction as any).toAccount === 'Checking' || (transaction as any).toAccount === 'Savings') 
                          ? 'bg-green-400' : 'bg-red-400'
                      }`}></div>
                    </div>
                  ) : (
                    <div className={`w-3 h-3 rounded-full ${
                      transaction.type === 'income' ? 'bg-green-400' : 'bg-red-400'
                    }`} />
                  )}
                  <div>
                    <p className="font-medium text-sm text-gray-900">{transaction.description}</p>
                    <p className="text-xs text-gray-500">{transaction.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold text-sm ${
                    transaction.type === 'income' ? 'text-green-600' :
                    transaction.type === 'expense' ? 'text-red-600' : 'text-gray-800'
                  }`}>
                    {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
                    {formatCurrency(transaction.amount)}
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
