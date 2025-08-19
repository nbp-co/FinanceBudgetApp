import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Wallet } from "lucide-react";

interface MobileHeaderProps {
  accountsTabValue?: string;
  onAccountsTabChange?: (value: string) => void;
}

export function MobileHeader({ accountsTabValue = "accounts", onAccountsTabChange }: MobileHeaderProps) {
  const { user } = useAuth();
  const [location] = useLocation();
  const isAccountsPage = location === "/accounts";

  const tabs = [
    { value: "accounts", label: "My Accounts" },
    { value: "statements", label: "Statements" },
    { value: "debt-payoff", label: "Debt Payoff" }
  ];

  return (
    <div className="lg:hidden sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">NBP Finance</h1>
        </div>
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
          <span className="text-white text-sm font-medium">
            {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
          </span>
        </div>
      </div>
      
      {/* Account tabs navigation - only show on accounts page */}
      {isAccountsPage && (
        <div className="px-4 pb-3">
          <div className="flex justify-center">
            <div className="grid grid-cols-3 bg-gray-100 rounded-lg p-1 w-full max-w-md">
              {tabs.map((tab) => (
                <button 
                  key={tab.value}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    accountsTabValue === tab.value
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => onAccountsTabChange?.(tab.value)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
