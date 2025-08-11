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
import { Plus, Building, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

const accountFormSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  type: z.enum(["checking", "savings", "investment", "credit_card", "loan"]),
  balance: z.string().min(1, "Balance is required"),
  description: z.string().optional(),
  interestRate: z.string().optional(),
  creditLimit: z.string().optional(),
});

type AccountFormData = z.infer<typeof accountFormSchema>;

export default function AccountsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: "",
      type: "checking",
      balance: "",
      description: "",
      interestRate: "",
      creditLimit: "",
    },
  });

  const handleSubmit = (data: AccountFormData) => {
    console.log("Creating account:", data);
    // Handle account creation here
    setIsDialogOpen(false);
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
                          <SelectItem value="investment">Investment</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="credit_card">Credit Card</SelectItem>
                          <SelectItem value="loan">Loan</SelectItem>
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
