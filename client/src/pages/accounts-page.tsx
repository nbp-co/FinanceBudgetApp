import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Building, CreditCard, Edit, Settings, Save, Minus, ChevronDown, ChevronUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
  const [isAssetDialogOpen, setIsAssetDialogOpen] = useState(false);
  const [isDebtDialogOpen, setIsDebtDialogOpen] = useState(false);
  const [isBalanceDialogOpen, setIsBalanceDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<{ name: string; balance: number } | null>(null);
  const [editingAccount, setEditingAccount] = useState<AccountFormData | null>(null);
  
  // Statements tab state
  const [selectedMonths, setSelectedMonths] = useState<string[]>(["2024-11", "2024-10", "2024-09"]);
  const [selectedAccountTypes, setSelectedAccountTypes] = useState<string[]>(['Asset', 'Debt']);
  const [isStatementsOpen, setIsStatementsOpen] = useState(true);

  // Statements data
  const availableMonths = [
    { value: "2024-12", label: "Dec 2024" },
    { value: "2024-11", label: "Nov 2024" },
    { value: "2024-10", label: "Oct 2024" },
    { value: "2024-09", label: "Sep 2024" },
    { value: "2024-08", label: "Aug 2024" },
    { value: "2024-07", label: "Jul 2024" },
  ];

  const allAccounts = [
    { name: "Checking Account", type: "Asset", accountType: "Checking", apr: null, dueDate: null },
    { name: "Savings Account", type: "Asset", accountType: "Savings", apr: 4.25, dueDate: null },
    { name: "Money Market", type: "Asset", accountType: "Money Market", apr: 3.5, dueDate: null },
    { name: "Credit Card", type: "Debt", accountType: "Credit Card", apr: 24.99, dueDate: 15 },
    { name: "Mortgage", type: "Debt", accountType: "Mortgage", apr: 6.5, dueDate: 1 },
    { name: "Auto Loan", type: "Debt", accountType: "Auto Loan", apr: 5.2, dueDate: 10 },
  ];

  // Interest data by month - debt accounts only
  const interestData = [
    { month: 'Jul 2024', 'Credit Card': 47.23, 'Mortgage': 1542.88, 'Auto Loan': 78.95 },
    { month: 'Aug 2024', 'Credit Card': 47.23, 'Mortgage': 1542.88, 'Auto Loan': 78.95 },
    { month: 'Sep 2024', 'Credit Card': 47.23, 'Mortgage': 1542.88, 'Auto Loan': 78.95 },
    { month: 'Oct 2024', 'Credit Card': 47.23, 'Mortgage': 1542.88, 'Auto Loan': 78.95 },
    { month: 'Nov 2024', 'Credit Card': 47.23, 'Mortgage': 1542.88, 'Auto Loan': 78.95 },
    { month: 'Dec 2024', 'Credit Card': 47.23, 'Mortgage': 1542.88, 'Auto Loan': 78.95 },
  ];

  // Colors for different account sub-types
  const chartColors = {
    'Credit Card': '#ef4444', // red
    'Mortgage': '#f97316', // orange
    'Auto Loan': '#eab308', // yellow
    'Savings': '#22c55e', // green
    'Money Market': '#3b82f6', // blue
  };

  // Sort accounts by type and subtype
  const sortedAccounts = allAccounts.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'Asset' ? -1 : 1;
    }
    return a.accountType.localeCompare(b.accountType);
  });

  // Filter accounts based on selected types
  const accounts = sortedAccounts.filter(account => 
    selectedAccountTypes.includes(account.type)
  );

  const toggleMonth = (monthValue: string) => {
    setSelectedMonths(prev => 
      prev.includes(monthValue) 
        ? prev.filter(m => m !== monthValue)
        : [...prev, monthValue].sort().reverse()
    );
  };

  const toggleAccountType = (accountType: string) => {
    setSelectedAccountTypes(prev => 
      prev.includes(accountType) 
        ? prev.filter(t => t !== accountType)
        : [...prev, accountType]
    );
  };
  
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

  const handleAssetSubmit = (data: AccountFormData) => {
    console.log("Creating asset account:", data);
    // Handle asset account creation here
    setIsAssetDialogOpen(false);
    form.reset();
  };

  const handleDebtSubmit = (data: AccountFormData) => {
    console.log("Creating debt account:", data);
    // Handle debt account creation here
    setIsDebtDialogOpen(false);
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

  const AddAssetAccountDialog = () => (
    <Dialog open={isAssetDialogOpen} onOpenChange={setIsAssetDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1 h-3 w-3" />
          Add Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Asset Account</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleAssetSubmit)} className="space-y-4">
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
                      <SelectItem value="checking">Checking</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                      <SelectItem value="money_market">Money Market</SelectItem>
                      <SelectItem value="investment">Investment</SelectItem>
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

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAssetDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Account</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );

  const AddDebtAccountDialog = () => (
    <Dialog open={isDebtDialogOpen} onOpenChange={setIsDebtDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1 h-3 w-3" />
          Add Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Debt Account</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleDebtSubmit)} className="space-y-4">
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
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="mortgage">Mortgage</SelectItem>
                      <SelectItem value="student_loan">Student Loan</SelectItem>
                      <SelectItem value="auto_loan">Auto Loan</SelectItem>
                      <SelectItem value="line_of_credit">Line of Credit</SelectItem>
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
                    <Input placeholder="e.g., Visa •••• 1234" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDebtDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Account</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );

  const EditAccountDialog = () => {
    const isAssetAccount = editingAccount?.type && ["checking", "savings", "money_market", "investment"].includes(editingAccount.type);
    const isDebtAccount = editingAccount?.type && ["credit_card", "mortgage", "student_loan", "auto_loan", "line_of_credit"].includes(editingAccount.type);

    return (
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit {isAssetAccount ? "Asset" : isDebtAccount ? "Debt" : ""} Account - {editingAccount?.name}</DialogTitle>
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
                        {isAssetAccount ? (
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder={isAssetAccount ? "e.g., Primary checking account" : "e.g., Visa •••• 1234"} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isAssetAccount && (
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

              {isDebtAccount && (
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
  };

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
        <Tabs defaultValue="accounts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="accounts">My Accounts</TabsTrigger>
            <TabsTrigger value="statements">Statements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="accounts" className="space-y-8">
            {/* Asset Accounts */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Building className="mr-2 h-5 w-5 text-green-600" />
                  Asset Accounts
                </h2>
                <AddAssetAccountDialog />
              </div>
          <div className="grid gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Checking Account</h3>
                    <p className="text-sm text-gray-600">Primary checking account</p>
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
                    <Button 
                      variant="ghost" 
                      size="sm" 
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
                      <Settings className="h-4 w-4" />
                    </Button>
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
                  <div className="flex items-center space-x-2">
                    <p className="text-lg font-semibold text-green-600">{formatCurrency(25890.12)}</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => openBalanceAdjustment("Savings Account", 25890.12)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
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
                      <Settings className="h-4 w-4" />
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
            <AddDebtAccountDialog />
          </div>
          <div className="grid gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Credit Card</h3>
                    <p className="text-sm text-gray-600">Visa •••• 1234 • 22.99% APR</p>
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
                    <Button 
                      variant="ghost" 
                      size="sm" 
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
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
            <EditAccountDialog />
            <BalanceAdjustmentDialog />
          </TabsContent>

          <TabsContent value="statements" className="space-y-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Account Types:</p>
                  <div className="flex gap-4">
                    {['Asset', 'Debt'].map(type => (
                      <label key={type} className="flex items-center space-x-2">
                        <Checkbox
                          checked={selectedAccountTypes.includes(type)}
                          onCheckedChange={() => toggleAccountType(type)}
                        />
                        <span className="text-sm text-gray-700">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Select months to edit:</p>
                  <div className="flex flex-wrap gap-4">
                    {availableMonths.map(month => (
                      <label key={month.value} className="flex items-center space-x-2">
                        <Checkbox
                          checked={selectedMonths.includes(month.value)}
                          onCheckedChange={() => toggleMonth(month.value)}
                        />
                        <span className="text-sm text-gray-700">{month.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {selectedMonths.length > 0 && (
                <Collapsible open={isStatementsOpen} onOpenChange={setIsStatementsOpen}>
                  <Card>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl">Monthly Statements</CardTitle>
                          <Button variant="ghost" size="sm">
                            {isStatementsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="flex justify-end mb-4">
                          <Button variant="outline" size="sm">
                            <Save className="mr-1 h-3 w-3" />
                            Save All Changes
                          </Button>
                        </div>
                        
                        <div className="relative">
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-[280px] sticky left-0 bg-white z-20 border-r-2 border-gray-400">Account</TableHead>
                                  {selectedMonths.map(monthValue => {
                                    const monthLabel = availableMonths.find(m => m.value === monthValue)?.label || monthValue;
                                    return (
                                      <TableHead key={monthValue} className="text-center min-w-[120px]">
                                        {monthLabel}
                                      </TableHead>
                                    );
                                  })}
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {accounts.map((account) => (
                                  <TableRow key={account.name} className="hover:bg-gray-50">
                                    <TableCell className="sticky left-0 bg-white z-10 border-r-2 border-gray-400">
                                      <div className="space-y-2">
                                        <div className="font-medium text-gray-900">{account.name}</div>
                                        <div className="flex flex-wrap gap-1">
                                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                            account.type === 'Asset' 
                                              ? 'bg-green-100 text-green-800' 
                                              : 'bg-red-100 text-red-800'
                                          }`}>
                                            {account.type}
                                          </span>
                                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 text-center">
                                            {account.accountType}
                                          </span>
                                        </div>
                                        <div className="text-xs text-gray-500 space-y-0.5">
                                          {account.apr && (
                                            <div>{account.type === 'Asset' ? 'APY' : 'APR'}: {account.apr}%</div>
                                          )}
                                          {account.dueDate && (
                                            <div>Due: {account.dueDate}th</div>
                                          )}
                                        </div>
                                      </div>
                                    </TableCell>

                                    {selectedMonths.map(monthValue => (
                                      <TableCell key={`${account.name}-${monthValue}`} className="text-center">
                                        <div className="space-y-1">
                                          <div className="relative">
                                            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                                            <Input
                                              type="text"
                                              defaultValue={
                                                account.name === "Checking Account" ? "12,345.67" :
                                                account.name === "Savings Account" ? "25,890.12" :
                                                account.name === "Money Market" ? "8,500.00" :
                                                account.name === "Credit Card" ? "2,456.78" :
                                                account.name === "Mortgage" ? "285,000.00" :
                                                "15,250.00"
                                              }
                                              className="w-28 text-center pl-6"
                                            />
                                            <span className="absolute -top-1 -left-1 text-xs text-gray-400 font-medium">B</span>
                                          </div>
                                          <div className="relative">
                                            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">$</span>
                                            <Input
                                              type="text"
                                              defaultValue={
                                                account.name === "Checking Account" ? "0.00" :
                                                account.name === "Savings Account" ? "95.43" :
                                                account.name === "Money Market" ? "25.18" :
                                                account.name === "Credit Card" ? "47.23" :
                                                account.name === "Mortgage" ? "1,542.88" :
                                                "78.95"
                                              }
                                              className="w-28 text-center text-xs pl-6"
                                            />
                                            <span className="absolute -top-1 -left-1 text-xs text-gray-400 font-medium">I</span>
                                          </div>
                                        </div>
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              )}

              {/* Interest Chart - Debt Accounts Only */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Interest Expense by Debt Account</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={interestData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis 
                          dataKey="month" 
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip 
                          formatter={(value) => [`$${value}`, '']}
                          labelStyle={{ color: '#374151' }}
                          contentStyle={{ 
                            backgroundColor: '#f9fafb',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px'
                          }}
                        />
                        <Legend />
                        <Bar dataKey="Credit Card" stackId="a" fill={chartColors['Credit Card']} />
                        <Bar dataKey="Mortgage" stackId="a" fill={chartColors['Mortgage']} />
                        <Bar dataKey="Auto Loan" stackId="a" fill={chartColors['Auto Loan']} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
