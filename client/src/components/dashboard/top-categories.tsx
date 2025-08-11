import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ShoppingCart, Car, Gamepad2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function TopCategories() {
  // Mock data - in real app this would come from API
  const topCategories = [
    {
      id: "1",
      name: "Housing",
      amount: 1800.00,
      icon: Home,
      color: "orange"
    },
    {
      id: "2", 
      name: "Groceries",
      amount: 487.23,
      icon: ShoppingCart,
      color: "purple"
    },
    {
      id: "3",
      name: "Transportation",
      amount: 324.18,
      icon: Car,
      color: "blue"
    },
    {
      id: "4",
      name: "Entertainment", 
      amount: 235.91,
      icon: Gamepad2,
      color: "green"
    }
  ];

  const getIconBgColor = (color: string) => {
    switch (color) {
      case "orange":
        return "bg-orange-100";
      case "purple":
        return "bg-purple-100";
      case "blue":
        return "bg-blue-100";
      case "green":
        return "bg-green-100";
      default:
        return "bg-gray-100";
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case "orange":
        return "text-orange-600";
      case "purple":
        return "text-purple-600";
      case "blue":
        return "text-blue-600";
      case "green":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${getIconBgColor(category.color)} rounded-lg flex items-center justify-center`}>
                    <Icon className={`h-4 w-4 ${getIconColor(category.color)}`} />
                  </div>
                  <span className="text-gray-700 font-medium">{category.name}</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(category.amount)}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
