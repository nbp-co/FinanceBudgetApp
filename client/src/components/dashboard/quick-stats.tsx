import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";

export function QuickStats() {
  // Mock data - in real app this would come from API
  const monthlyStats = {
    income: 4500.00,
    expenses: 2847.32,
    net: 1652.68
  };

  const budgetProgress = {
    percentage: 63
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>This Month</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <ArrowDown className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-gray-700 font-medium">Income</span>
            </div>
            <span className="font-semibold text-green-600">
              ${monthlyStats.income.toFixed(2)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <ArrowUp className="h-4 w-4 text-red-600" />
              </div>
              <span className="text-gray-700 font-medium">Expenses</span>
            </div>
            <span className="font-semibold text-red-600">
              ${monthlyStats.expenses.toFixed(2)}
            </span>
          </div>
          
          <hr className="border-gray-200" />
          
          <div className="flex items-center justify-between">
            <span className="text-gray-900 font-semibold">Net Income</span>
            <span className="font-bold text-primary">
              ${monthlyStats.net.toFixed(2)}
            </span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Budget Used</span>
            <span>{budgetProgress.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${budgetProgress.percentage}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
