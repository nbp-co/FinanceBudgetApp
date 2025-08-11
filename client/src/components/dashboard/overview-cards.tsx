import { Card, CardContent } from "@/components/ui/card";
import { formatCurrencyWhole } from "@/lib/utils";

export function OverviewCards() {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 mb-8">
      <Card>
        <CardContent className="p-3 sm:p-4 md:p-6">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Assets</p>
            <p className="text-lg sm:text-2xl md:text-3xl font-bold text-green-600 truncate">{formatCurrencyWhole(24567.89)}</p>
          </div>
          <div className="mt-2 sm:mt-3 md:mt-4 flex items-center text-xs sm:text-sm">
            <span className="text-green-600">5.2%</span>
            <span className="text-gray-500 ml-1 sm:ml-2 truncate">last mo</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 sm:p-4 md:p-6">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Debts</p>
            <p className="text-lg sm:text-2xl md:text-3xl font-bold text-red-600 truncate">{formatCurrencyWhole(8234.12)}</p>
          </div>
          <div className="mt-2 sm:mt-3 md:mt-4 flex items-center text-xs sm:text-sm">
            <span className="text-green-600">2.1%</span>
            <span className="text-gray-500 ml-1 sm:ml-2 truncate">last mo</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 sm:p-4 md:p-6">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Net Worth</p>
            <p className="text-lg sm:text-2xl md:text-3xl font-bold text-primary truncate">{formatCurrencyWhole(16333.77)}</p>
          </div>
          <div className="mt-2 sm:mt-3 md:mt-4 flex items-center text-xs sm:text-sm">
            <span className="text-green-600">8.7%</span>
            <span className="text-gray-500 ml-1 sm:ml-2 truncate">last mo</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
