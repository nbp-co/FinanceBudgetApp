import { AppShell } from "@/components/layout/app-shell";
import { MonthlyCalendar } from "@/components/dashboard/monthly-calendar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AddTransactionModal } from "@/components/transactions/add-transaction-modal";
import { Plus } from "lucide-react";

export default function HomePage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <AppShell>
      <div className="p-4 lg:p-8">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
              <p className="text-gray-600">View your transactions and upcoming events</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <MonthlyCalendar />
      </div>

      <AddTransactionModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </AppShell>
  );
}
