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
        <MonthlyCalendar />
      </div>

      {/* Floating Add Transaction Button */}
      <Button 
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-24 lg:bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <AddTransactionModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </AppShell>
  );
}
