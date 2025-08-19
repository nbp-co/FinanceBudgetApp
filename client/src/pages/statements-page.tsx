import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DebtPayoffCalculator } from "@/components/accounts/debt-payoff-calculator";
import { useQuery } from "@tanstack/react-query";
import type { Account } from "@shared/schema";

export default function StatementsPage() {
  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
  });

  return (
    <AppShell>
      <div className="p-4 lg:p-8">
        <Tabs defaultValue="statements" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="statements">Statements</TabsTrigger>
            <TabsTrigger value="debt-payoff">Debt Payoff</TabsTrigger>
          </TabsList>
          
          <TabsContent value="statements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Statements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Monthly statement features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="debt-payoff" className="space-y-6">
            <DebtPayoffCalculator accounts={accounts} />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}