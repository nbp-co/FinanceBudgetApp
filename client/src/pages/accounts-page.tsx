import { AppShell } from "@/components/layout/app-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountList } from "@/components/accounts/account-list";

export default function AccountsPage() {
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
            <div className="text-center py-8">
              <p className="text-gray-500">Statements feature coming soon</p>
            </div>
          </TabsContent>
          
          <TabsContent value="debt-payoff" className="space-y-6">
            <div className="text-center py-8">
              <p className="text-gray-500">Debt payoff feature coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}