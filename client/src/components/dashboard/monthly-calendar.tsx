import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, getDay, isSameDay } from "date-fns";

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

  // Mock transaction data - would come from API
  const getTransactionsForDay = (date: Date) => {
    const dayOfMonth = date.getDate();
    if (!isSameMonth(date, currentDate)) return [];
    
    // Mock some transactions with more detail
    if (dayOfMonth === 1) return [
      { id: '1', type: 'income', amount: 4500, description: 'Salary Deposit', category: 'Salary', time: '09:00' }
    ];
    if (dayOfMonth === 3) return [
      { id: '2', type: 'expense', amount: 127, description: 'Grocery Shopping', category: 'Groceries', time: '14:30' },
      { id: '3', type: 'income', amount: 50, description: 'Freelance Payment', category: 'Freelance', time: '16:00' }
    ];
    if (dayOfMonth === 5) return [
      { id: '4', type: 'transfer', amount: 1000, description: 'Transfer to Savings', category: 'Transfer', time: '10:15' }
    ];
    if (dayOfMonth === 10) return [
      { id: '5', type: 'income', amount: 500, description: 'Investment Dividend', category: 'Investment', time: '08:00' },
      { id: '6', type: 'expense', amount: 200, description: 'Utility Bill', category: 'Utilities', time: '11:30' },
      { id: '7', type: 'transfer', amount: 300, description: 'Credit Card Payment', category: 'Transfer', time: '15:45' }
    ];
    if (isToday(date)) return [
      { id: '8', type: 'expense', amount: 85, description: 'Coffee & Lunch', category: 'Food', time: '12:15' },
      { id: '9', type: 'expense', amount: 45, description: 'Gas Station', category: 'Transportation', time: '16:30' }
    ];
    return [];
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
                  <Calendar className="h-4 w-4 mr-2" />
                  Today
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
                className={`h-20 border rounded-lg p-1 cursor-pointer transition-colors ${
                  isSelected 
                    ? 'bg-primary border-primary text-white' 
                    : isTodayDate 
                      ? 'bg-primary/10 border-primary/30 hover:bg-primary/20' 
                      : 'border-gray-100 hover:bg-gray-50'
                } ${!isCurrentMonth ? 'cursor-not-allowed' : ''}`}
              >
                <div className={`text-sm ${
                  isSelected
                    ? 'text-white font-semibold'
                    : isCurrentMonth 
                      ? isTodayDate 
                        ? 'text-primary font-semibold' 
                        : 'text-gray-900 font-medium'
                      : 'text-gray-400'
                }`}>
                  {format(day, 'd')}
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {transactions.slice(0, 3).map((transaction, txIndex) => {
                    let colorClass = '';
                    if (transaction.type === 'income') colorClass = isSelected ? 'bg-white/80' : 'bg-green-400';
                    else if (transaction.type === 'expense') colorClass = isSelected ? 'bg-white/80' : 'bg-red-400';
                    else if (transaction.type === 'transfer') colorClass = isSelected ? 'bg-white/80' : 'bg-blue-400';
                    
                    return (
                      <div
                        key={txIndex}
                        className={`w-2 h-2 ${colorClass} rounded-full`}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Calendar Legend */}
        <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-400 rounded-full mr-2" />
            <span className="text-gray-600">Income</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-400 rounded-full mr-2" />
            <span className="text-gray-600">Expense</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-400 rounded-full mr-2" />
            <span className="text-gray-600">Transfer</span>
          </div>
        </div>
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
        {selectedDate && isToday(selectedDate) && (
          <span className="text-sm text-primary font-medium">Today</span>
        )}
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
                    <p className="text-xs text-gray-500">{transaction.category} • {transaction.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold text-sm ${
                    transaction.type === 'income' ? 'text-green-600' :
                    transaction.type === 'expense' ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
                    ${transaction.amount.toFixed(2)}
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
