import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Building, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function AccountsPage() {
  return (
    <AppShell>
      <div className="p-4 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
            <p className="text-gray-600">Manage your financial accounts</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Account
          </Button>
        </div>

        {/* Asset Accounts */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Building className="mr-2 h-5 w-5 text-green-600" />
            Asset Accounts
          </h2>
          <div className="grid gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Checking Account</h3>
                    <p className="text-sm text-gray-600">Primary checking account</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-green-600">{formatCurrency(12345.67)}</p>
                    <p className="text-sm text-gray-600">Available Balance</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Savings Account</h3>
                    <p className="text-sm text-gray-600">High-yield savings • 4.5% APY</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-green-600">{formatCurrency(25890.12)}</p>
                    <p className="text-sm text-gray-600">Available Balance</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Debt Accounts */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CreditCard className="mr-2 h-5 w-5 text-red-600" />
            Debt Accounts
          </h2>
          <div className="grid gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Credit Card</h3>
                    <p className="text-sm text-gray-600">Visa •••• 1234 • 22.99% APR</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-red-600">{formatCurrency(2456.78)}</p>
                    <p className="text-sm text-gray-600">Current Balance</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
