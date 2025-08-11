import { useAuth } from "@/hooks/use-auth";
import { Wallet } from "lucide-react";

export function MobileHeader() {
  const { user } = useAuth();

  return (
    <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">BudgetApp</h1>
        </div>
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
          <span className="text-white text-sm font-medium">
            {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
          </span>
        </div>
      </div>
    </div>
  );
}
