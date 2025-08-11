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
        <OverviewCards />

        <div className="mt-8">
          <TransactionPeriodView 
            accountFilter={accountFilter} 
            onAccountFilterChange={setAccountFilter}
          />
        </div>
      </div>
    </AppShell>
  );
}
