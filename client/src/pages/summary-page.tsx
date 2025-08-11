import { AppShell } from "@/components/layout/app-shell";
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { TransactionPeriodView } from "@/components/dashboard/transaction-period-view";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SummaryPage() {
  const [accountFilter, setAccountFilter] = useState("all");

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
            </div>
          </div>
        </div>

        {/* Financial Overview Cards */}
        <OverviewCards />

        {/* Transaction Period View */}
        <div className="mt-8">
          <TransactionPeriodView />
        </div>
      </div>
    </AppShell>
  );
}
