import { AppShell } from "@/components/layout/app-shell";
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { QuickStats } from "@/components/dashboard/quick-stats";
import { TopCategories } from "@/components/dashboard/top-categories";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddTransactionModal } from "@/components/transactions/add-transaction-modal";
import { Plus } from "lucide-react";

export default function SummaryPage() {
  const [accountFilter, setAccountFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <AppShell>
      <div className="p-4 lg:p-8">
        {/* Page Header with Account Filter */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Summary</h1>
              <p className="text-gray-600">Track your finances and manage your budget</p>
            </div>
            <div className="flex items-center space-x-3">
              <Select value={accountFilter} onValueChange={setAccountFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter accounts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  <SelectItem value="assets">Assets Only</SelectItem>
                  <SelectItem value="debts">Debts Only</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
            </div>
          </div>
        </div>

        {/* Financial Overview Cards */}
        <OverviewCards />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Recent Transactions Column */}
          <div className="lg:col-span-2 space-y-6">
            <RecentTransactions />
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <QuickStats />
            <TopCategories />
          </div>
        </div>
      </div>

      <AddTransactionModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </AppShell>
  );
}
