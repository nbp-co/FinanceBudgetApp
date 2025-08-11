import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
import { formatCurrencyWhole } from "@/lib/utils";

export function OverviewCards() {
  return (
    <Card className="mb-8">
      <CardContent className="p-4 sm:p-6">
        <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-2xl mx-auto">
          <div className="p-3 rounded-lg bg-white border border-gray-200 shadow-sm">
            <p className="text-xs font-medium text-gray-600 truncate">Total Assets</p>
            <div className="flex items-center space-x-2">
              <p className="text-lg sm:text-xl font-bold text-green-600">{formatCurrencyWhole(24567.89)}</p>
              <div className="flex items-center text-xs text-green-600">
                <ArrowUp className="mr-1 h-3 w-3" />
                <span>5.2% MoM</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-white border border-gray-200 shadow-sm">
            <p className="text-xs font-medium text-gray-600 truncate">Total Debts</p>
            <div className="flex items-center space-x-2">
              <p className="text-lg sm:text-xl font-bold text-red-600">{formatCurrencyWhole(8234.12)}</p>
              <div className="flex items-center text-xs text-green-600">
                <ArrowDown className="mr-1 h-3 w-3" />
                <span>2.1% MoM</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-white border border-gray-200 shadow-sm">
            <p className="text-xs font-medium text-gray-600 truncate">Net Worth</p>
            <div className="flex items-center space-x-2">
              <p className="text-lg sm:text-xl font-bold text-primary">{formatCurrencyWhole(16333.77)}</p>
              <div className="flex items-center text-xs text-green-600">
                <ArrowUp className="mr-1 h-3 w-3" />
                <span>8.7% MoM</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
