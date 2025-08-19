import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, CreditCard, Edit, FileText, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { AccountForm } from "./account-form";
import type { Account } from "@shared/schema";

export function AccountList() {
  const [isAssetDialogOpen, setIsAssetDialogOpen] = useState(false);
  const [isDebtDialogOpen, setIsDebtDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["/api/accounts"],
    queryFn: () => fetch("/api/accounts").then(res => res.json())
  });

  if (isLoading) {
    return <div>Loading accounts...</div>;
  }

  const assetAccounts = Array.isArray(accounts) ? accounts.filter(account => account.type === "ASSET") : [];
  const debtAccounts = Array.isArray(accounts) ? accounts.filter(account => account.type === "DEBT") : [];

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
  };

  const closeEditDialog = () => {
    setEditingAccount(null);
  };

  return (
    <div className="space-y-6">
      {/* Asset Accounts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Building className="h-5 w-5 text-teal-600" />
            Asset Accounts
          </CardTitle>
          <Button onClick={() => setIsAssetDialogOpen(true)} size="sm" className="bg-teal-600 hover:bg-teal-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {assetAccounts.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No asset accounts found. Add one to get started!</p>
          ) : (
            assetAccounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">{account.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">
                    {account.subtype.replace('_', ' ')}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {formatCurrency(parseFloat(account.openingBalance || "0"))}
                    </p>
                    {account.aprApy && (
                      <p className="text-sm text-gray-500">{account.aprApy}% APY</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditAccount(account)}>
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEditAccount(account)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Debt Accounts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-red-600" />
            Debt Accounts
          </CardTitle>
          <Button onClick={() => setIsDebtDialogOpen(true)} size="sm" className="bg-teal-600 hover:bg-teal-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {debtAccounts.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No debt accounts found.</p>
          ) : (
            debtAccounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">{account.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">
                    {account.subtype.replace('_', ' ')}
                  </p>
                  {account.aprApy && (
                    <p className="text-sm text-gray-500">{account.aprApy}% APR</p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-red-600">
                      {formatCurrency(parseFloat(account.openingBalance || "0"))}
                    </p>
                    {account.creditLimit && (
                      <p className="text-sm text-gray-500">
                        Limit: {formatCurrency(parseFloat(account.creditLimit))}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditAccount(account)}>
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEditAccount(account)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Account Form Dialogs */}
      <AccountForm
        isOpen={isAssetDialogOpen}
        onClose={() => setIsAssetDialogOpen(false)}
        type="ASSET"
      />
      
      <AccountForm
        isOpen={isDebtDialogOpen}
        onClose={() => setIsDebtDialogOpen(false)}
        type="DEBT"
      />
      
      {editingAccount && (
        <AccountForm
          isOpen={true}
          onClose={closeEditDialog}
          type={editingAccount.type}
          account={editingAccount}
        />
      )}
    </div>
  );
}