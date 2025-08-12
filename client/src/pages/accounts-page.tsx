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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Building, CreditCard, Edit, Settings, Save, Minus, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

const accountFormSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  type: z.enum(["checking", "savings", "money_market", "investment", "other_asset", "credit_card", "mortgage", "student_loan", "auto_loan", "line_of_credit", "other_debt"]),
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
  const [selectedSubTypes, setSelectedSubTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'type'>('type');
  const [isStatementsOpen, setIsStatementsOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const accountsPerPage = 5;

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
    { name: "Business Checking", type: "Asset", accountType: "Business Checking", apr: null, dueDate: null },
    { name: "Savings Account", type: "Asset", accountType: "Savings", apr: 4.25, dueDate: null },
    { name: "Money Market", type: "Asset", accountType: "Money Market", apr: 3.5, dueDate: null },
    { name: "Investment Account", type: "Asset", accountType: "Investment", apr: 7.8, dueDate: null },
    { name: "Emergency Fund", type: "Asset", accountType: "Savings", apr: 4.0, dueDate: null },
    { name: "Retirement 401k", type: "Asset", accountType: "Investment", apr: 8.2, dueDate: null },
    { name: "Credit Card", type: "Debt", accountType: "Credit Card", apr: 24.99, dueDate: 15 },
    { name: "Mortgage", type: "Debt", accountType: "Mortgage", apr: 6.5, dueDate: 1 },
    { name: "Auto Loan", type: "Debt", accountType: "Auto Loan", apr: 5.2, dueDate: 10 },
    { name: "Student Loan", type: "Debt", accountType: "Student Loan", apr: 4.8, dueDate: 5 },
    { name: "Personal Loan", type: "Debt", accountType: "Line of Credit", apr: 12.5, dueDate: 20 },
    { name: "Business Credit Card", type: "Debt", accountType: "Credit Card", apr: 18.9, dueDate: 25 },
    { name: "Taxes Owed", type: "Debt", accountType: "Taxes", apr: null, dueDate: null },
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

  // Get unique sub-types for filtering
  const allSubTypes = [...new Set(allAccounts.map(account => account.accountType))];

  // Sort accounts based on sortBy preference
  const sortedAccounts = allAccounts.sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else { // sortBy === 'type'
      // First by type (Debt first, then Asset)
      if (a.type !== b.type) {
        return a.type === 'Debt' ? -1 : 1;
      }
      // Then by account sub-type within same type
      return a.accountType.localeCompare(b.accountType);
    }
  });

  // Filter accounts based on selected types and sub-types
  const filteredAccounts = sortedAccounts.filter(account => {
    const typeMatch = selectedAccountTypes.includes(account.type);
    const subTypeMatch = selectedSubTypes.length === 0 || selectedSubTypes.includes(account.accountType);
    return typeMatch && subTypeMatch;
  });

  // Pagination logic for statements
  const totalPages = Math.ceil(filteredAccounts.length / accountsPerPage);
  const startIndex = currentPage * accountsPerPage;
  const endIndex = startIndex + accountsPerPage;
  const paginatedAccounts = filteredAccounts.slice(startIndex, endIndex);

  // For non-statements tabs, show all accounts
  const accounts = filteredAccounts;

  // Helper function to get balance value from input default value
  const getBalance = (accountName: string): number => {
    const balanceMap: { [key: string]: number } = {
      "Checking Account": 12345.67,
      "Business Checking": 8750.00,
      "Savings Account": 25890.12,
      "Money Market": 8500.00,
      "Investment Account": 45230.00,
      "Emergency Fund": 12000.00,
      "Retirement 401k": 125500.00,
      "Credit Card": 2456.78,
      "Mortgage": 285000.00,
      "Auto Loan": 18450.00,
      "Student Loan": 23800.00,
      "Personal Loan": 5200.00,
      "Business Credit Card": 1850.00,
      "Taxes Owed": 3500.00,
    };
    return balanceMap[accountName] || 15250.00;
  };

  // Helper function to get interest value from input default value
  const getInterest = (accountName: string): number => {
    const interestMap: { [key: string]: number } = {
      "Checking Account": 0.00,
      "Business Checking": 0.00,
      "Savings Account": 95.43,
      "Money Market": 25.18,
      "Investment Account": 295.83,
      "Emergency Fund": 40.00,
      "Retirement 401k": 857.50,
      "Credit Card": 47.23,
      "Mortgage": 1542.88,
      "Auto Loan": 78.95,
      "Student Loan": 95.20,
      "Personal Loan": 54.17,
      "Business Credit Card": 29.12,
      "Taxes Owed": 0.00,
    };
    return interestMap[accountName] || 25.50;
  };

  // Calculate total balance and interest across all accounts for the month
  const calculateTotals = (monthValue: string) => {
    const totalBalance = paginatedAccounts.reduce((sum, account) => sum + getBalance(account.name), 0);
    const totalInterest = paginatedAccounts.reduce((sum, account) => sum + getInterest(account.name), 0);
    
    // Calculate estimated overall APR (annualized)
    const estimatedAPR = totalBalance > 0 ? (totalInterest * 12 / totalBalance) * 100 : 0;
    
    return { totalBalance, totalInterest, estimatedAPR };
  };

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
    setCurrentPage(0); // Reset to first page when filter changes
  };

  const toggleSubType = (subType: string) => {
    setSelectedSubTypes(prev => 
      prev.includes(subType) 
        ? prev.filter(t => t !== subType)
        : [...prev, subType]
    );
    setCurrentPage(0); // Reset to first page when filter changes
  };

  const handleSortChange = (newSortBy: 'name' | 'type') => {
    setSortBy(newSortBy);
    setCurrentPage(0); // Reset to first page when sort changes
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

  const handleEditAccount = (data: AccountFormData) => {
    console.log("Editing account:", data);
    // Handle account editing here
    setIsEditDialogOpen(false);
    setEditingAccount(null);
    form.reset();
  };

  const handleBalanceAdjustment = (data: BalanceAdjustmentData) => {
    console.log("Adjusting balance:", data);
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

  const openEditAccount = (account: AccountFormData) => {
    setEditingAccount(account);
    form.reset(account);
    setIsEditDialogOpen(true);
  };

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
                                  <SelectItem value="business_checking">Business Checking</SelectItem>
                                  <SelectItem value="money_market">Money Market</SelectItem>
                                  <SelectItem value="investment">Investment</SelectItem>
                                  <SelectItem value="other_asset">Other Asset</SelectItem>
                                </SelectContent>
                              </Select>
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">Savings Account</h3>
                        <p className="text-sm text-gray-600">High-yield savings</p>
                        <p className="text-sm text-gray-500">4.5% APY</p>
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
                                <Input placeholder="e.g., Main Credit Card" {...field} />
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
                                  <SelectItem value="taxes">Taxes</SelectItem>
                                  <SelectItem value="other_debt">Other Debt</SelectItem>
                                </SelectContent>
                              </Select>
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
              </div>
              <div className="grid gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">Credit Card</h3>
                        <p className="text-sm text-gray-600">Visa •••• 1234</p>
                        <p className="text-sm text-gray-500">22.99% APR</p>
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
          </TabsContent>

          <TabsContent value="statements" className="space-y-6">
            <div className="space-y-6">
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
                    <div className="space-y-4 px-6 pb-2">
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
                        <p className="text-sm text-gray-600 mb-2">Sort by:</p>
                        <div className="flex gap-4">
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="sortBy"
                              checked={sortBy === 'type'}
                              onChange={() => handleSortChange('type')}
                              className="text-blue-600"
                            />
                            <span className="text-sm text-gray-700">Type (Debt → Asset)</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="sortBy"
                              checked={sortBy === 'name'}
                              onChange={() => handleSortChange('name')}
                              className="text-blue-600"
                            />
                            <span className="text-sm text-gray-700">Name (A → Z)</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 mb-2">Filter by Sub-type:</p>
                        <div className="flex flex-wrap gap-4">
                          {allSubTypes.map(subType => (
                            <label key={subType} className="flex items-center space-x-2">
                              <Checkbox
                                checked={selectedSubTypes.includes(subType)}
                                onCheckedChange={() => toggleSubType(subType)}
                              />
                              <span className="text-sm text-gray-700">{subType}</span>
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
                                  <TableHead className="w-[200px] sticky left-0 bg-white z-20 border-r-2 border-gray-400">Account</TableHead>
                                  {selectedMonths.map(monthValue => {
                                    const monthLabel = availableMonths.find(m => m.value === monthValue)?.label || monthValue;
                                    return (
                                      <TableHead key={monthValue} className="text-center min-w-[100px]">
                                        {monthLabel}
                                      </TableHead>
                                    );
                                  })}
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {paginatedAccounts.map((account) => (
                                  <TableRow key={account.name} className="hover:bg-gray-50">
                                    <TableCell className="w-[200px] sticky left-0 bg-white z-10 border-r-2 border-gray-400">
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
                                                account.name === "Business Checking" ? "8,750.00" :
                                                account.name === "Savings Account" ? "25,890.12" :
                                                account.name === "Money Market" ? "8,500.00" :
                                                account.name === "Investment Account" ? "45,230.00" :
                                                account.name === "Emergency Fund" ? "12,000.00" :
                                                account.name === "Retirement 401k" ? "125,500.00" :
                                                account.name === "Credit Card" ? "2,456.78" :
                                                account.name === "Mortgage" ? "285,000.00" :
                                                account.name === "Auto Loan" ? "18,450.00" :
                                                account.name === "Student Loan" ? "23,800.00" :
                                                account.name === "Personal Loan" ? "5,200.00" :
                                                account.name === "Business Credit Card" ? "1,850.00" :
                                                account.name === "Taxes Owed" ? "3,500.00" :
                                                "15,250.00"
                                              }
                                              className="w-28 h-8 text-center pl-6"
                                            />
                                            <span className="absolute -top-1 -left-1 text-xs text-gray-400 font-medium">B</span>
                                          </div>
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <div className="relative">
                                                  <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">$</span>
                                                  <Input
                                                    type="text"
                                                    defaultValue={
                                                      account.name === "Checking Account" ? "0.00" :
                                                      account.name === "Business Checking" ? "0.00" :
                                                      account.name === "Savings Account" ? "95.43" :
                                                      account.name === "Money Market" ? "25.18" :
                                                      account.name === "Investment Account" ? "295.83" :
                                                      account.name === "Emergency Fund" ? "40.00" :
                                                      account.name === "Retirement 401k" ? "857.50" :
                                                      account.name === "Credit Card" ? "47.23" :
                                                      account.name === "Mortgage" ? "1,542.88" :
                                                      account.name === "Auto Loan" ? "78.95" :
                                                      account.name === "Student Loan" ? "95.20" :
                                                      account.name === "Personal Loan" ? "54.17" :
                                                      account.name === "Business Credit Card" ? "29.12" :
                                                      account.name === "Taxes Owed" ? "0.00" :
                                                      "25.50"
                                                    }
                                                    className="w-28 h-8 text-center text-xs pl-6"
                                                  />
                                                  <span className="absolute -top-1 -left-1 text-xs text-gray-400 font-medium">I</span>
                                                </div>
                                              </TooltipTrigger>
                                              <TooltipContent 
                                                side="top" 
                                                className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg min-w-[200px]"
                                              >
                                                <p className="font-medium">{account.name}</p>
                                                <p className="text-xs opacity-90">
                                                  {monthValue.slice(0, 3)} {monthValue.slice(-4)}
                                                  {account.apr && ` (${account.type === 'Asset' ? 'APY' : 'APR'}: ${account.apr}%)`}
                                                </p>
                                                {(() => {
                                                  const totals = calculateTotals(monthValue);
                                                  return (
                                                    <div className="mt-2 pt-2 border-t border-gray-700">
                                                      <p className="text-xs opacity-90">
                                                        Total Balance: ${totals.totalBalance.toLocaleString()}
                                                      </p>
                                                      <p className="text-xs opacity-90">
                                                        Total Interest: ${totals.totalInterest.toFixed(2)}
                                                      </p>
                                                      <p className="text-xs opacity-90">
                                                        Est. Overall APR: {totals.estimatedAPR.toFixed(2)}%
                                                      </p>
                                                    </div>
                                                  );
                                                })()}
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        </div>
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-between mt-4 px-2">
                            <div className="text-sm text-gray-700">
                              Showing {startIndex + 1}-{Math.min(endIndex, filteredAccounts.length)} of {filteredAccounts.length} accounts
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                disabled={currentPage === 0}
                              >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                              </Button>
                              <span className="text-sm text-gray-700">
                                Page {currentPage + 1} of {totalPages}
                              </span>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                                disabled={currentPage === totalPages - 1}
                              >
                                Next
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            </div>

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
                      <RechartsTooltip 
                        formatter={(value, name) => [`$${value}`, `${name}`]}
                        labelFormatter={(label) => `${label}`}
                        labelStyle={{ 
                          color: '#374151',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          marginBottom: '4px'
                        }}
                        contentStyle={{ 
                          backgroundColor: '#ffffff',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                          padding: '12px',
                          minWidth: '180px',
                          fontSize: '13px'
                        }}
                        itemStyle={{
                          color: '#374151',
                          fontSize: '13px',
                          fontWeight: '500',
                          padding: '2px 0'
                        }}
                        cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
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
          </TabsContent>
        </Tabs>

        {/* Balance Adjustment Dialog */}
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
      </div>
    </AppShell>
  );
}