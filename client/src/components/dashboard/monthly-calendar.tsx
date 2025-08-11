import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, getDay, isSameDay } from "date-fns";
import { formatCurrency } from "@/lib/utils";

export function MonthlyCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get days from previous month to fill the grid
  const startPadding = getDay(monthStart);
  const previousMonthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth(), 0);
  const paddingDays = Array.from({ length: startPadding }, (_, i) => 
    new Date(previousMonthEnd.getFullYear(), previousMonthEnd.getMonth(), previousMonthEnd.getDate() - startPadding + i + 1)
  );
  
  // Get days from next month to fill the grid
  const totalCells = 42; // 6 rows × 7 days
  const remainingCells = totalCells - paddingDays.length - daysInMonth.length;
  const nextMonthDays = Array.from({ length: remainingCells }, (_, i) => 
    new Date(monthEnd.getFullYear(), monthEnd.getMonth() + 1, i + 1)
  );
  
  const allDays = [...paddingDays, ...daysInMonth, ...nextMonthDays];
  
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
      { id: '4', type: 'transfer', amount: 1000, description: 'Transfer to Savings', category: 'Transfer' }
    ];
    if (dayOfMonth === 10) return [
      { id: '5', type: 'income', amount: 500, description: 'Investment Dividend', category: 'Investment' },
      { id: '6', type: 'expense', amount: 200, description: 'Utility Bill', category: 'Utilities' },
      { id: '7', type: 'transfer', amount: 300, description: 'Credit Card Payment', category: 'Transfer' }
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
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={goToPrevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-3">
                <CardTitle className="text-xl">{format(currentDate, 'MMMM yyyy')}</CardTitle>
                <Button variant="outline" size="sm" onClick={goToToday}>
                  <Calendar className="h-4 w-4" />
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
                    <div className={`text-sm font-medium flex items-center justify-center w-6 h-6 rounded-full ${
                      isSelected
                        ? 'bg-primary text-white'
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
                      let colorClass = '';
                      if (transaction.type === 'income') colorClass = 'bg-green-400';
                      else if (transaction.type === 'expense') colorClass = 'bg-red-400';
                      else if (transaction.type === 'transfer') colorClass = 'bg-blue-400';
                      
                      return (
                        <div
                          key={txIndex}
                          className={`w-1.5 h-1.5 ${colorClass} rounded-full`}
                        />
                      );
                    })}
                    {transactions.length > 2 && (
                      <div className="text-xs text-gray-400">+</div>
                    )}
                  </div>
                  {/* Show ending balance for days with transactions */}
                  {transactions.length > 0 && isCurrentMonth && (
                    <div className="mt-auto">
                      <div className="text-xs text-center text-gray-600 font-medium truncate">
                        {formatCurrency(getDailyBalance(day))}
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
                  <div className={`w-3 h-3 rounded-full ${
                    transaction.type === 'income' ? 'bg-green-400' :
                    transaction.type === 'expense' ? 'bg-red-400' : 'bg-blue-400'
                  }`} />
                  <div>
                    <p className="font-medium text-sm text-gray-900">{transaction.description}</p>
                    <p className="text-xs text-gray-500">{transaction.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold text-sm ${
                    transaction.type === 'income' ? 'text-green-600' :
                    transaction.type === 'expense' ? 'text-red-600' : 'text-blue-600'
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
