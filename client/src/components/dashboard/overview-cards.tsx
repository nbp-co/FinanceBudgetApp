import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, ArrowUp, BarChart3 } from "lucide-react";
import { formatCurrencyWhole } from "@/lib/utils";

export function OverviewCards() {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 mb-8">
      <Card>
        <CardContent className="p-3 sm:p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Assets</p>
              <p className="text-lg sm:text-2xl md:text-3xl font-bold text-green-600 truncate">{formatCurrencyWhole(24567.89)}</p>
            </div>
            <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 ml-2">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 md:mt-4 flex items-center text-xs sm:text-sm">
            <span className="text-green-600 flex items-center">
              <ArrowUp className="mr-1 h-3 w-3" />
              5.2%
            </span>
            <span className="text-gray-500 ml-1 sm:ml-2 truncate">from last month</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 sm:p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Debts</p>
              <p className="text-lg sm:text-2xl md:text-3xl font-bold text-red-600 truncate">{formatCurrencyWhole(8234.12)}</p>
            </div>
            <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 ml-2">
              <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-red-600" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 md:mt-4 flex items-center text-xs sm:text-sm">
            <span className="text-green-600 flex items-center">
              <TrendingDown className="mr-1 h-3 w-3" />
              2.1%
            </span>
            <span className="text-gray-500 ml-1 sm:ml-2 truncate">from last month</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 sm:p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Net Worth</p>
              <p className="text-lg sm:text-2xl md:text-3xl font-bold text-primary truncate">{formatCurrencyWhole(16333.77)}</p>
            </div>
            <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 ml-2">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 md:mt-4 flex items-center text-xs sm:text-sm">
            <span className="text-green-600 flex items-center">
              <ArrowUp className="mr-1 h-3 w-3" />
              8.7%
            </span>
            <span className="text-gray-500 ml-1 sm:ml-2 truncate">from last month</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
