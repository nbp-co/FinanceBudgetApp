import { AppShell } from "@/components/layout/app-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountList } from "@/components/accounts/account-list";
import { DebtPayoffCalculator } from "@/components/accounts/debt-payoff-calculator";
import { useQuery } from "@tanstack/react-query";
import type { Account } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export default function AccountsPage() {
  // Fetch accounts for debt payoff calculator
  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Accounts</h1>
        </div>
        
        <Tabs defaultValue="accounts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="accounts">My Accounts</TabsTrigger>
            <TabsTrigger value="statements">Statements</TabsTrigger>
            <TabsTrigger value="debt-payoff">Debt Payoff</TabsTrigger>
          </TabsList>
          
          <TabsContent value="accounts" className="space-y-6">
            <AccountList />
          </TabsContent>
          
          <TabsContent value="statements" className="space-y-6">
            <div className="text-center py-8 space-y-4">
              <p className="text-gray-600">Access your detailed monthly statements</p>
              <Button asChild>
                <a href="/statements" className="inline-flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Go to Statements Page
                </a>
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="debt-payoff" className="space-y-6">
            <DebtPayoffCalculator accounts={accounts} />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}