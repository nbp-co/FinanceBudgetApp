import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, getDay } from "date-fns";

export function MonthlyCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
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

  // Mock transaction data - would come from API
  const getTransactionsForDay = (date: Date) => {
    const dayOfMonth = date.getDate();
    if (!isSameMonth(date, currentDate)) return [];
    
    // Mock some transactions
    if (dayOfMonth === 1) return [{ type: 'income', amount: 4500 }];
    if (dayOfMonth === 3) return [{ type: 'expense', amount: 127 }, { type: 'income', amount: 50 }];
    if (dayOfMonth === 5) return [{ type: 'transfer', amount: 1000 }];
    if (dayOfMonth === 10) return [{ type: 'income', amount: 500 }, { type: 'expense', amount: 200 }, { type: 'transfer', amount: 300 }];
    return [];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{format(currentDate, 'MMMM yyyy')}</CardTitle>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={goToPrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center p-2 text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
          
          {/* Calendar Days */}
          {allDays.map((day, index) => {
            const transactions = getTransactionsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isTodayDate = isToday(day);
            
            return (
              <div
                key={index}
                className={`h-20 border border-gray-100 rounded-lg p-1 hover:bg-gray-50 cursor-pointer ${
                  isTodayDate ? 'bg-primary/5 border-primary/20' : ''
                }`}
              >
                <div className={`text-sm ${
                  isCurrentMonth 
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
                    if (transaction.type === 'income') colorClass = 'bg-green-400';
                    else if (transaction.type === 'expense') colorClass = 'bg-red-400';
                    else if (transaction.type === 'transfer') colorClass = 'bg-blue-400';
                    
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
  );
}
