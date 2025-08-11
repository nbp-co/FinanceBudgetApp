import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
import { formatCurrencyWhole } from "@/lib/utils";

export function OverviewCards() {
  return (
    <Card className="mb-8">
      <CardContent className="p-4 sm:p-6">
        <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6">
          <div className="p-3 rounded-lg bg-white border border-gray-200 shadow-sm">
            <div>
              <p className="text-xs font-medium text-gray-600 truncate">Total Assets</p>
              <p className="text-lg sm:text-xl font-bold text-green-600 truncate">{formatCurrencyWhole(24567.89)}</p>
            </div>
            <div className="mt-2 flex items-center text-xs">
              <span className="text-green-600 flex items-center">
                <ArrowUp className="mr-1 h-3 w-3" />
                5.2%
              </span>
              <span className="text-gray-500 ml-1 truncate">MoM</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-white border border-gray-200 shadow-sm">
            <div>
              <p className="text-xs font-medium text-gray-600 truncate">Total Debts</p>
              <p className="text-lg sm:text-xl font-bold text-red-600 truncate">{formatCurrencyWhole(8234.12)}</p>
            </div>
            <div className="mt-2 flex items-center text-xs">
              <span className="text-green-600 flex items-center">
                <ArrowDown className="mr-1 h-3 w-3" />
                2.1%
              </span>
              <span className="text-gray-500 ml-1 truncate">MoM</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-white border border-gray-200 shadow-sm">
            <div>
              <p className="text-xs font-medium text-gray-600 truncate">Net Worth</p>
              <p className="text-lg sm:text-xl font-bold text-primary truncate">{formatCurrencyWhole(16333.77)}</p>
            </div>
            <div className="mt-2 flex items-center text-xs">
              <span className="text-green-600 flex items-center">
                <ArrowUp className="mr-1 h-3 w-3" />
                8.7%
              </span>
              <span className="text-gray-500 ml-1 truncate">MoM</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
