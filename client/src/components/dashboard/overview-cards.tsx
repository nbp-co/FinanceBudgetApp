import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, ArrowUp, BarChart3 } from "lucide-react";

export function OverviewCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Assets</p>
              <p className="text-3xl font-bold text-green-600">$24,567.89</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 flex items-center">
              <ArrowUp className="mr-1 h-3 w-3" />
              5.2%
            </span>
            <span className="text-gray-500 ml-2">from last month</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Debts</p>
              <p className="text-3xl font-bold text-red-600">$8,234.12</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 flex items-center">
              <TrendingDown className="mr-1 h-3 w-3" />
              2.1%
            </span>
            <span className="text-gray-500 ml-2">from last month</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Worth</p>
              <p className="text-3xl font-bold text-primary">$16,333.77</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 flex items-center">
              <ArrowUp className="mr-1 h-3 w-3" />
              8.7%
            </span>
            <span className="text-gray-500 ml-2">from last month</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
