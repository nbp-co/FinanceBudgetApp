import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { Link } from "wouter";
import { formatCurrency } from "@/lib/utils";

// Component for split-colored transfer icon
function SplitTransferIcon({ isIncoming = false }: { isIncoming?: boolean }) {
  return (
    <div className="relative h-5 w-5">
      <ArrowUpDown className="h-5 w-5 text-blue-600 absolute inset-0" style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }} />
      <ArrowUpDown className={`h-5 w-5 ${isIncoming ? 'text-green-600' : 'text-red-600'} absolute inset-0`} style={{ clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)' }} />
    </div>
  );
}

export function RecentTransactions() {
  // Mock data - in real app this would come from API
  const recentTransactions = [
    {
      id: "1",
      description: "Salary Deposit",
      amount: 4500.00,
      type: "INCOME" as const,
      account: "Checking Account",
      category: "Salary",
      date: "Nov 1, 2024"
    },
    {
      id: "2", 
      description: "Grocery Shopping",
      amount: -127.45,
      type: "EXPENSE" as const,
      account: "Credit Card",
      category: "Groceries", 
      date: "Nov 3, 2024"
    },
    {
      id: "3",
      description: "Transfer to Savings", 
      amount: 1000.00,
      type: "TRANSFER" as const,
      account: "Checking",
      toAccount: "Savings",
      date: "Nov 5, 2024"
    },
    {
      id: "4",
      description: "Monthly Rent",
      amount: -1800.00,
      type: "EXPENSE" as const,
      account: "Checking Account",
      category: "Housing",
      date: "Nov 1, 2024"
    }
  ];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "INCOME":
        return <ArrowDown className="h-5 w-5 text-green-600" />;
      case "EXPENSE":
        return <ArrowUp className="h-5 w-5 text-red-600" />;
      case "TRANSFER":
        // For demo purposes, assume transfers "to Savings" are incoming to the main account view
        return <SplitTransferIcon isIncoming={false} />;
      default:
        return <ArrowUpDown className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTransactionBgColor = (type: string) => {
    switch (type) {
      case "INCOME":
        return "bg-green-100";
      case "EXPENSE":
        return "bg-red-100";
      case "TRANSFER":
        return "bg-gradient-to-r from-blue-100 to-red-100";
      default:
        return "bg-gray-100";
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case "INCOME":
        return "text-green-600";
      case "EXPENSE":
        return "text-red-600";
      case "TRANSFER":
        return "text-gray-800";
      default:
        return "text-gray-600";
    }
  };

  const formatAmount = (amount: number, type: string) => {
    const absAmount = Math.abs(amount);
    if (type === "INCOME") {
      return `+${formatCurrency(absAmount)}`;
    } else if (type === "EXPENSE") {
      return `-${formatCurrency(absAmount)}`;
    } else {
      return formatCurrency(absAmount);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Transactions</CardTitle>
          <Link href="/transactions" className="text-sm text-primary hover:text-primary/80 font-medium">
            View all
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${getTransactionBgColor(transaction.type)} rounded-full flex items-center justify-center`}>
                  {getTransactionIcon(transaction.type)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{transaction.description}</p>
                  <p className="text-sm text-gray-500">
                    {transaction.type === "TRANSFER" ? (
                      <>
                        <span>{transaction.account}</span> → <span>{transaction.toAccount}</span>
                      </>
                    ) : (
                      <>
                        <span>{transaction.account}</span> • <span>{transaction.category}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${getAmountColor(transaction.type)}`}>
                  {formatAmount(transaction.amount, transaction.type)}
                </p>
                <p className="text-sm text-gray-500">{transaction.date}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
