import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Building, CreditCard, Edit, Settings } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

const accountFormSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  type: z.enum(["checking", "savings", "money_market", "investment", "credit_card", "mortgage", "student_loan", "auto_loan", "line_of_credit"]),
  balance: z.string().min(1, "Balance is required"),
  description: z.string().optional(),
  interestRate: z.string().optional(),
  creditLimit: z.string().optional(),
  apr: z.string().optional(),
  dueDate: z.string().optional(),
});

const balanceAdjustmentSchema = z.object({
  newBalance: z.string().min(1, "New balance is required"),
});

type AccountFormData = z.infer<typeof accountFormSchema>;
type BalanceAdjustmentData = z.infer<typeof balanceAdjustmentSchema>;

export default function AccountsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBalanceDialogOpen, setIsBalanceDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<{ name: string; balance: number } | null>(null);
  const [editingAccount, setEditingAccount] = useState<AccountFormData | null>(null);
  
  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: "",
      type: "checking",
      balance: "",
      description: "",
      interestRate: "",
      creditLimit: "",
      apr: "",
      dueDate: "",
    },
  });

  const balanceForm = useForm<BalanceAdjustmentData>({
    resolver: zodResolver(balanceAdjustmentSchema),
    defaultValues: {
      newBalance: "",
    },
  });

  const handleSubmit = (data: AccountFormData) => {
    console.log("Creating account:", data);
    // Handle account creation here
    setIsDialogOpen(false);
    form.reset();
  };

  const handleBalanceAdjustment = (data: BalanceAdjustmentData) => {
    console.log("Adjusting balance for", selectedAccount?.name, "to", data.newBalance);
    // Handle balance adjustment here
    setIsBalanceDialogOpen(false);
    setSelectedAccount(null);
    balanceForm.reset();
  };

  const openBalanceAdjustment = (accountName: string, currentBalance: number) => {
    setSelectedAccount({ name: accountName, balance: currentBalance });
    balanceForm.setValue("newBalance", currentBalance.toString());
    setIsBalanceDialogOpen(true);
  };

  const openEditAccount = (accountData: AccountFormData) => {
    setEditingAccount(accountData);
    // Pre-populate the form with existing account data
    form.reset(accountData);
    setIsEditDialogOpen(true);
  };

  const handleEditAccount = (data: AccountFormData) => {
    console.log("Editing account:", editingAccount?.name, "with data:", data);
    // Handle account editing here
    setIsEditDialogOpen(false);
    setEditingAccount(null);
    form.reset();
  };

  const AddAccountDialog = ({ accountType }: { accountType: "asset" | "debt" }) => (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1 h-3 w-3" />
          Add Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New {accountType === "asset" ? "Asset" : "Debt"} Account</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Main Checking" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accountType === "asset" ? (
                        <>
                          <SelectItem value="checking">Checking</SelectItem>
                          <SelectItem value="savings">Savings</SelectItem>
                          <SelectItem value="money_market">Money Market</SelectItem>
                          <SelectItem value="investment">Investment</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="credit_card">Credit Card</SelectItem>
                          <SelectItem value="mortgage">Mortgage</SelectItem>
                          <SelectItem value="student_loan">Student Loan</SelectItem>
                          <SelectItem value="auto_loan">Auto Loan</SelectItem>
                          <SelectItem value="line_of_credit">Line of Credit</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Balance</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Primary checking account" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {accountType === "asset" && (
              <FormField
                control={form.control}
                name="interestRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interest Rate (Optional)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="4.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {accountType === "debt" && (
              <>
                <FormField
                  control={form.control}
                  name="creditLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credit Limit (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="5000.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="apr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>APR (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="5.25" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Due Date (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="31" placeholder="15" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Account</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );

  const EditAccountDialog = () => (
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Account - {editingAccount?.name}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleEditAccount)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Main Checking" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Primary checking account" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {editingAccount?.type && ["savings", "money_market", "investment"].includes(editingAccount.type) && (
              <FormField
                control={form.control}
                name="interestRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interest Rate (Optional)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="4.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {editingAccount?.type && ["credit_card", "line_of_credit"].includes(editingAccount.type) && (
              <>
                <FormField
                  control={form.control}
                  name="creditLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credit Limit (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="5000.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="apr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>APR (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="5.25" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {editingAccount?.type && ["mortgage", "student_loan", "auto_loan"].includes(editingAccount.type) && (
              <>
                <FormField
                  control={form.control}
                  name="apr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>APR (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="5.25" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Due Date (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="31" placeholder="15" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Account</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );

  const BalanceAdjustmentDialog = () => (
    <Dialog open={isBalanceDialogOpen} onOpenChange={setIsBalanceDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Balance - {selectedAccount?.name}</DialogTitle>
        </DialogHeader>
        <Form {...balanceForm}>
          <form onSubmit={balanceForm.handleSubmit(handleBalanceAdjustment)} className="space-y-4">
            <div className="text-sm text-gray-600">
              Current Balance: {selectedAccount && formatCurrency(selectedAccount.balance)}
            </div>
            
            <FormField
              control={balanceForm.control}
              name="newBalance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Balance</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsBalanceDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Balance</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );

  return (
    <AppShell>
      <div className="p-4 lg:p-8">
        {/* Asset Accounts */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Building className="mr-2 h-5 w-5 text-green-600" />
              Asset Accounts
            </h2>
            <AddAccountDialog accountType="asset" />
          </div>
          <div className="grid gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Checking Account</h3>
                    <p className="text-sm text-gray-600">Primary checking account</p>
                    <button 
                      className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                      onClick={() => openEditAccount({
                        name: "Checking Account",
                        type: "checking",
                        balance: "12345.67",
                        description: "Primary checking account",
                        interestRate: "",
                        creditLimit: "",
                        apr: "",
                        dueDate: "",
                      })}
                    >
                      Edit Account
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className="text-lg font-semibold text-green-600">{formatCurrency(12345.67)}</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => openBalanceAdjustment("Checking Account", 12345.67)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Savings Account</h3>
                    <p className="text-sm text-gray-600">High-yield savings • 4.5% APY</p>
                    <button 
                      className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                      onClick={() => openEditAccount({
                        name: "Savings Account",
                        type: "savings",
                        balance: "25890.12",
                        description: "High-yield savings • 4.5% APY",
                        interestRate: "4.5",
                        creditLimit: "",
                        apr: "",
                        dueDate: "",
                      })}
                    >
                      Edit Account
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className="text-lg font-semibold text-green-600">{formatCurrency(25890.12)}</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => openBalanceAdjustment("Savings Account", 25890.12)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Debt Accounts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <CreditCard className="mr-2 h-5 w-5 text-red-600" />
              Debt Accounts
            </h2>
            <AddAccountDialog accountType="debt" />
          </div>
          <div className="grid gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Credit Card</h3>
                    <p className="text-sm text-gray-600">Visa •••• 1234 • 22.99% APR</p>
                    <button 
                      className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                      onClick={() => openEditAccount({
                        name: "Credit Card",
                        type: "credit_card",
                        balance: "2456.78",
                        description: "Visa •••• 1234 • 22.99% APR",
                        interestRate: "",
                        creditLimit: "5000",
                        apr: "22.99",
                        dueDate: "15",
                      })}
                    >
                      Edit Account
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className="text-lg font-semibold text-red-600">{formatCurrency(2456.78)}</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => openBalanceAdjustment("Credit Card", 2456.78)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <EditAccountDialog />
        <BalanceAdjustmentDialog />
      </div>
    </AppShell>
  );
}
