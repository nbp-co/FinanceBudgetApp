import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Building, CreditCard, Edit, Settings, Save, Minus, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, TrendingDown, TrendingUp, DollarSign, Calculator, Calendar, Target, Zap, CalendarDays, CheckCircle2, FileText, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

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
  
  // Notes state
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [selectedAccountForNotes, setSelectedAccountForNotes] = useState<string | null>(null);
  const [accountNotes, setAccountNotes] = useState<{ [accountName: string]: string[] }>({
    "Checking Account": ["Primary account for monthly expenses", "Direct deposit setup"],
    "Credit Card": ["Pay off before statement date", "Rewards card for groceries"],
    "Savings Account": ["Emergency fund target: $10,000", "High-yield account"]
  });
  const [newNote, setNewNote] = useState("");
  
  // Statements tab state
  const [selectedMonths, setSelectedMonths] = useState<string[]>(["2025-01", "2025-02", "2025-03"]);
  const [selectedAccountTypes, setSelectedAccountTypes] = useState<string[]>(['Asset', 'Debt']);
  const [selectedSubTypes, setSelectedSubTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'name-reverse' | 'type-reverse'>('type');
  const [isStatementsOpen, setIsStatementsOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const accountsPerPage = 5;

  // Debt payoff tab state
  const [paymentSchedules, setPaymentSchedules] = useState<{ [accountName: string]: { frequency: string; amount: number; paymentAccount: string; nextDueDate: string } }>({});
  const [expandedCharts, setExpandedCharts] = useState<{ [accountName: string]: boolean }>({});
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedDebtAccount, setSelectedDebtAccount] = useState<string | null>(null);
  
  // Debt sort/filter state
  const [debtSortBy, setDebtSortBy] = useState<'name' | 'nameDesc' | 'balance' | 'balanceAsc' | 'interest' | 'payoff' | 'apr' | 'aprAsc'>('balance');
  const [debtFilterBy, setDebtFilterBy] = useState<string[]>([]);
  
  // Debt payoff info popup state
  const [showDebtPayoffInfo, setShowDebtPayoffInfo] = useState(false);
  const [hideDebtPayoffInfo, setHideDebtPayoffInfo] = useState(localStorage.getItem('hideDebtPayoffInfo') === 'true');
  
  // Payment form state
  const [currentPaymentForm, setCurrentPaymentForm] = useState({
    account: '',
    amount: '',
    frequency: '',
    paymentSource: '',
    startDate: new Date().toISOString().split('T')[0]
  });

  // Mobile tab navigation state
  const [activeTab, setActiveTab] = useState("accounts");

  // Debt summary view mode state
  const [summaryViewMode, setSummaryViewMode] = useState<'table' | 'chart'>('table');
  const [summaryChartMode, setSummaryChartMode] = useState<'balance' | 'interest'>('balance');
  const [summaryMonthOffset, setSummaryMonthOffset] = useState(1); // 1 = JUL-DEC 2025, 0 = JAN-JUN 2025, -1 = JUL-DEC 2024, -2 = JAN-JUN 2024

  // Collapsible section states
  const [isDebtAccountsExpanded, setIsDebtAccountsExpanded] = useState(true);
  const [isDebtSummaryExpanded, setIsDebtSummaryExpanded] = useState(true);

  // Statements data
  const availableMonths = [
    { value: "2025-01", label: "JAN 2025" },
    { value: "2025-02", label: "FEB 2025" },
    { value: "2025-03", label: "MAR 2025" },
    { value: "2025-04", label: "APR 2025" },
    { value: "2025-05", label: "MAY 2025" },
    { value: "2025-06", label: "JUN 2025" },
    { value: "2025-07", label: "JUL 2025" },
    { value: "2025-08", label: "AUG 2025" },
    { value: "2025-09", label: "SEP 2025" },
    { value: "2025-10", label: "OCT 2025" },
    { value: "2025-11", label: "NOV 2025" },
    { value: "2025-12", label: "DEC 2025" },
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

  // Get unique sub-types for filtering based on selected account types
  const availableSubTypes = Array.from(new Set(
    allAccounts
      .filter(account => selectedAccountTypes.includes(account.type))
      .map(account => account.accountType)
  ));

  // Sort accounts based on sortBy preference
  const sortedAccounts = allAccounts.sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'name-reverse') {
      return b.name.localeCompare(a.name);
    } else if (sortBy === 'type-reverse') {
      // First by type (Asset first, then Debt)
      if (a.type !== b.type) {
        return a.type === 'Asset' ? -1 : 1;
      }
      // Then by account sub-type within same type
      return a.accountType.localeCompare(b.accountType);
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
    setIsAssetDialogOpen(false);
    form.reset();
  };

  const handleDebtSubmit = (data: AccountFormData) => {
    console.log("Creating debt account:", data);
    setIsDebtDialogOpen(false);
    form.reset();
  };

  const handleBalanceAdjustment = (data: BalanceAdjustmentData) => {
    console.log("Adjusting balance for", selectedAccount?.name, "to", data.newBalance);
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
    form.reset(accountData);
    setIsEditDialogOpen(true);
  };

  const handleEditAccount = (data: AccountFormData) => {
    console.log("Editing account:", editingAccount?.name, "with data:", data);
    setIsEditDialogOpen(false);
    setEditingAccount(null);
    form.reset();
  };

  const toggleMonth = (monthValue: string) => {
    setSelectedMonths(prev => 
      prev.includes(monthValue) 
        ? prev.filter(m => m !== monthValue)
        : [...prev, monthValue].sort()
    );
  };

  const toggleAccountType = (accountType: string) => {
    setSelectedAccountTypes(prev => 
      prev.includes(accountType) 
        ? prev.filter(t => t !== accountType)
        : [...prev, accountType]
    );
  };

  const toggleSubType = (subType: string) => {
    setSelectedSubTypes(prev => 
      prev.includes(subType) 
        ? prev.filter(s => s !== subType)
        : [...prev, subType]
    );
  };

  const handleSortChange = (value: string) => {
    setSortBy(value as 'name' | 'type' | 'name-reverse' | 'type-reverse');
  };

  const openNotesDialog = (accountName: string) => {
    setSelectedAccountForNotes(accountName);
    setIsNotesDialogOpen(true);
  };

  const addNote = () => {
    if (newNote.trim() && selectedAccountForNotes) {
      setAccountNotes(prev => ({
        ...prev,
        [selectedAccountForNotes]: [...(prev[selectedAccountForNotes] || []), newNote.trim()]
      }));
      setNewNote("");
    }
  };

  const removeNote = (accountName: string, noteIndex: number) => {
    setAccountNotes(prev => ({
      ...prev,
      [accountName]: prev[accountName]?.filter((_, index) => index !== noteIndex) || []
    }));
  };

  // Get debt accounts for debt payoff tab
  const getDebtAccounts = () => {
    return allAccounts.filter(account => account.type === 'Debt');
  };

  // Calculate debt payoff scenarios
  const calculatePayoff = (balance: number, rate: number, payment: number) => {
    const monthlyRate = rate / 100 / 12;
    if (monthlyRate === 0) return { months: Math.ceil(balance / payment), totalInterest: 0 };
    
    const months = Math.ceil(-Math.log(1 - (balance * monthlyRate) / payment) / Math.log(1 + monthlyRate));
    const totalPaid = months * payment;
    const totalInterest = totalPaid - balance;
    
    return { months, totalInterest };
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
                      <SelectItem value="other_asset">Other Asset</SelectItem>
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
                    <Input placeholder="e.g., Credit Card" {...field} />
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
                      <SelectItem value="other_debt">Other Debt</SelectItem>
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
    const isAssetAccount = editingAccount?.type && ["checking", "savings", "money_market", "investment", "other_asset"].includes(editingAccount.type);
    const isDebtAccount = editingAccount?.type && ["credit_card", "mortgage", "student_loan", "auto_loan", "line_of_credit", "other_debt"].includes(editingAccount.type);

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

  return (
    <AppShell>
      <div className="p-4 lg:p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-lg">
            <TabsTrigger value="accounts">My Accounts</TabsTrigger>
            <TabsTrigger value="statements">Statements</TabsTrigger>
            <TabsTrigger value="debt-payoff">Debt Payoff</TabsTrigger>
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
                {allAccounts.filter(account => account.type === 'Asset').map((account) => (
                  <Card key={account.name}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{account.name}</h3>
                          <p className="text-sm text-gray-600">{account.accountType}</p>
                          {account.apr && (
                            <p className="text-sm text-gray-500">{account.apr}% APY</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <p className="text-lg font-semibold text-green-600">
                            {formatCurrency(getBalance(account.name))}
                          </p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openBalanceAdjustment(account.name, getBalance(account.name))}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openEditAccount({
                              name: account.name,
                              type: account.accountType.toLowerCase().replace(' ', '_') as any,
                              balance: getBalance(account.name).toString(),
                              description: account.accountType,
                              interestRate: account.apr?.toString() || "",
                              creditLimit: "",
                              apr: "",
                              dueDate: "",
                            })}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openNotesDialog(account.name)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
                {allAccounts.filter(account => account.type === 'Debt').map((account) => (
                  <Card key={account.name}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{account.name}</h3>
                          <p className="text-sm text-gray-600">{account.accountType}</p>
                          {account.apr && (
                            <p className="text-sm text-gray-500">{account.apr}% APR</p>
                          )}
                          {account.dueDate && (
                            <p className="text-sm text-gray-500">Due: {account.dueDate}th</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <p className="text-lg font-semibold text-red-600">
                            {formatCurrency(getBalance(account.name))}
                          </p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openBalanceAdjustment(account.name, getBalance(account.name))}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openEditAccount({
                              name: account.name,
                              type: account.accountType.toLowerCase().replace(' ', '_') as any,
                              balance: getBalance(account.name).toString(),
                              description: account.accountType,
                              interestRate: "",
                              creditLimit: "5000",
                              apr: account.apr?.toString() || "",
                              dueDate: account.dueDate?.toString() || "",
                            })}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openNotesDialog(account.name)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
        
            <EditAccountDialog />
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
                      {/* Account Type Filter */}
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

                      {/* Month Selection */}
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Select months to edit:</p>
                        <div className="overflow-x-auto scrollbar-hide">
                          <div className="flex gap-4 pb-2 lg:grid lg:grid-cols-3 lg:gap-4 lg:overflow-visible" style={{ width: 'max-content' }}>
                            {availableMonths.map(month => (
                              <label key={month.value} className="flex items-center space-x-2 whitespace-nowrap min-w-[120px] lg:min-w-0">
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

                      {/* Controls */}
                      <div className="flex items-center gap-4 pt-2">
                        {/* Filter Dropdown */}
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-medium text-gray-600">Filter:</Label>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" className="min-w-[120px] justify-between">
                                {selectedAccountTypes.length === 2 ? 'All Types' : 
                                 selectedAccountTypes.length === 1 ? selectedAccountTypes[0] + ' Only' : 
                                 'No Types'}
                                <ChevronDown className="h-4 w-4 ml-2" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 p-3" align="start">
                              <div className="space-y-3">
                                <div>
                                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Account Types:</Label>
                                  <div className="space-y-2">
                                    {['Asset', 'Debt'].map((type) => (
                                      <div key={type} className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`acc-filter-type-${type}`}
                                          checked={selectedAccountTypes.includes(type)}
                                          onCheckedChange={() => toggleAccountType(type)}
                                        />
                                        <Label htmlFor={`acc-filter-type-${type}`} className="text-sm cursor-pointer">
                                          {type}
                                        </Label>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                {availableSubTypes.length > 0 && (
                                  <div>
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Sub-types:</Label>
                                    <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto">
                                      {availableSubTypes.map((subType) => (
                                        <div key={subType} className="flex items-center space-x-2">
                                          <Checkbox
                                            id={`acc-filter-subtype-${subType}`}
                                            checked={selectedSubTypes.includes(subType)}
                                            onCheckedChange={() => toggleSubType(subType)}
                                          />
                                          <Label htmlFor={`acc-filter-subtype-${subType}`} className="text-sm cursor-pointer">
                                            {subType}
                                          </Label>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-medium text-gray-600">Sort:</Label>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" className="min-w-[140px] justify-between">
                                {sortBy === 'type' ? 'Type (Debt → Asset)' : 
                                 sortBy === 'type-reverse' ? 'Type (Asset → Debt)' :
                                 sortBy === 'name' ? 'Name (A → Z)' : 
                                 sortBy === 'name-reverse' ? 'Name (Z → A)' : 'Type (Debt → Asset)'}
                                <ChevronDown className="h-4 w-4 ml-2" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 p-2" align="start">
                              <RadioGroup value={sortBy} onValueChange={handleSortChange} className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="type" id="acc-sort-type" />
                                  <Label htmlFor="acc-sort-type" className="text-sm cursor-pointer">
                                    Type (Debt → Asset)
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="type-reverse" id="acc-sort-type-reverse" />
                                  <Label htmlFor="acc-sort-type-reverse" className="text-sm cursor-pointer">
                                    Type (Asset → Debt)
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="name" id="acc-sort-name" />
                                  <Label htmlFor="acc-sort-name" className="text-sm cursor-pointer">
                                    Name (A → Z)
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="name-reverse" id="acc-sort-name-reverse" />
                                  <Label htmlFor="acc-sort-name-reverse" className="text-sm cursor-pointer">
                                    Name (Z → A)
                                  </Label>
                                </div>
                              </RadioGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>

                    {selectedMonths.length > 0 && (
                      <CardContent className="pt-0">
                        <div className="flex justify-between items-center mb-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-3">
                            <h4 className="text-lg font-semibold text-gray-900">Statement Details</h4>
                          </div>
                          <Button variant="outline" size="sm">
                            <Save className="mr-1 h-3 w-3" />
                            Save All Changes
                          </Button>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="relative rounded-lg border-2 border-gray-300 shadow-sm">
                          <div className="overflow-x-auto">
                            <Table className="border-separate border-spacing-0">
                              <TableHeader>
                                <TableRow className="border-none">
                                  <TableHead className="w-[200px] sticky left-0 bg-gray-200 z-20 border-r-2 border-gray-400 font-bold text-gray-800 py-2 px-4 rounded-tl-lg h-12">
                                    ACCOUNT
                                  </TableHead>
                                  {selectedMonths.map((monthValue, index) => {
                                    const monthLabel = availableMonths.find(m => m.value === monthValue)?.label || monthValue;
                                    const [month, year] = monthLabel.split(' ');
                                    return (
                                      <TableHead key={monthValue} className={`text-center min-w-[100px] py-2 px-3 bg-gray-400 text-white font-bold h-12 ${index === selectedMonths.length - 1 ? 'rounded-tr-lg' : 'border-r border-gray-300'}`}>
                                        <div className="text-sm font-bold whitespace-nowrap">
                                          {month.slice(0, 3).toUpperCase()} {year}
                                        </div>
                                      </TableHead>
                                    );
                                  })}
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {paginatedAccounts.map((account) => (
                                  <TableRow key={account.name} className="hover:bg-gray-50">
                                    <TableCell className="w-[200px] sticky left-0 bg-white z-10 border-r-2 border-gray-400 py-3">
                                      <div className="space-y-1.5">
                                        <div className="font-medium text-gray-900 text-sm">{account.name}</div>
                                        <div className="flex flex-wrap gap-1 justify-center">
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
                                        <div className="text-xs text-gray-500">
                                          {account.dueDate && (
                                            <div className="flex justify-between items-center">
                                              <span>Due: {account.dueDate}th</span>
                                              {account.apr && (
                                                <span>{account.type === 'Asset' ? 'APY' : 'APR'}: {account.apr}%</span>
                                              )}
                                            </div>
                                          )}
                                          {!account.dueDate && account.apr && (
                                            <div>{account.type === 'Asset' ? 'APY' : 'APR'}: {account.apr}%</div>
                                          )}
                                        </div>
                                      </div>
                                    </TableCell>

                                    {selectedMonths.map(monthValue => (
                                      <TableCell key={`${account.name}-${monthValue}`} className="text-center border-r border-gray-200 py-3">
                                        <div className="space-y-1">
                                          <div className="relative">
                                            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                                            <Input
                                              type="text"
                                              defaultValue={getBalance(account.name).toLocaleString()}
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
                                                    defaultValue={getInterest(account.name).toFixed(2)}
                                                    className="w-28 h-6 text-center pl-6 text-xs"
                                                  />
                                                  <span className="absolute -top-1 -left-1 text-xs text-gray-400 font-medium">I</span>
                                                </div>
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <p>Interest/Return for this month</p>
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

                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-between mt-4">
                            <p className="text-sm text-gray-700">
                              Showing {startIndex + 1} to {Math.min(endIndex, filteredAccounts.length)} of {filteredAccounts.length} accounts
                            </p>
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
                        </div>
                      </CardContent>
                    )}
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            </div>
          </TabsContent>

          <TabsContent value="debt-payoff" className="space-y-6">
            {/* Debt Overview */}
            <Card className="bg-pink-50">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">Debt Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Total Debt</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(340256.78)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Est. Monthly Interest</p>
                    <p className="text-xl font-semibold text-orange-600">{formatCurrency(1802)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">YTD Interest Paid</p>
                    <p className="text-xl font-semibold text-red-600">{formatCurrency(14419)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">End of Year Balance</p>
                    <p className="text-xl font-semibold text-gray-700">{formatCurrency(276512)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Debt Accounts & Management */}
            <Collapsible open={isDebtAccountsExpanded} onOpenChange={setIsDebtAccountsExpanded}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl flex items-center">
                        <CreditCard className="mr-2 h-5 w-5 text-red-600" />
                        Debt Accounts & Management
                        <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">6 accounts</span>
                      </CardTitle>
                      <Button variant="ghost" size="sm">
                        {isDebtAccountsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <div className="mb-4 flex items-center justify-between">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-1 h-3 w-3" />
                        Schedule Payment
                      </Button>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Label className="text-sm">Filter:</Label>
                          <Select value="all">
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Types</SelectItem>
                              <SelectItem value="credit">Credit Cards</SelectItem>
                              <SelectItem value="loans">Loans</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Label className="text-sm">Sort:</Label>
                          <Select value="balance">
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Balance (High)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="balance">Balance (High)</SelectItem>
                              <SelectItem value="interest">Interest Rate</SelectItem>
                              <SelectItem value="payoff">Payoff Date</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Debt Accounts Grid */}
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { name: "Mortgage", balance: 285000, apr: 6.5, rate: "6.5%", paymentDue: "$1,844", color: "blue", dueDate: "Jan 2054", nextPayment: "Jan 2025" },
                        { name: "Student Loan", balance: 23800, apr: 4.8, rate: "4.8%", paymentDue: "$268", color: "green", dueDate: "May 2034", nextPayment: "Sep 2025" },
                        { name: "Auto Loan", balance: 18450, apr: 5.2, rate: "5.2%", paymentDue: "$349", color: "purple", dueDate: "Apr 2029", nextPayment: "Apr 2025" },
                        { name: "Personal Loan", balance: 5200, apr: 12.5, rate: "12.5%", paymentDue: "$168", color: "orange", dueDate: "Dec 2027", nextPayment: "Mar 2025" },
                        { name: "Credit Card", balance: 2456, apr: 24.99, rate: "24.99%", paymentDue: "$49", color: "red", dueDate: "Never at minimum", nextPayment: "Sep 2025" },
                        { name: "Business Credit Card", balance: 1850, apr: 18.9, rate: "18.9%", paymentDue: "$37", color: "teal", dueDate: "Jan 2032", nextPayment: "Dec 2024" }
                      ].map((debt, index) => (
                        <div key={debt.name} className="bg-white border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 text-sm">{debt.name}</h3>
                            <div className="flex space-x-1">
                              <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
                                <TrendingUp className="h-3 w-3 text-blue-600" />
                              </Button>
                              <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
                                <Settings className="h-3 w-3 text-gray-400" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <p className="text-gray-500 mb-1">Balance</p>
                              <p className="font-bold text-gray-900">{formatCurrency(debt.balance)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">Rate</p>
                              <p className="font-semibold text-gray-700">{debt.rate}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">Payment Due</p>
                              <p className="font-semibold text-red-600">{debt.paymentDue}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">Next Payment</p>
                              <p className="font-semibold text-gray-700">{debt.nextPayment}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${
                                debt.color === 'blue' ? 'bg-blue-500' :
                                debt.color === 'green' ? 'bg-green-500' :
                                debt.color === 'purple' ? 'bg-purple-500' :
                                debt.color === 'orange' ? 'bg-orange-500' :
                                debt.color === 'red' ? 'bg-red-500' :
                                debt.color === 'teal' ? 'bg-teal-500' : 'bg-gray-500'
                              }`}></div>
                              <span className="text-xs text-gray-600">Payoff: {debt.dueDate}</span>
                            </div>
                            <Button variant="ghost" size="sm" className="text-xs px-2 py-1 h-6 text-blue-600 hover:bg-blue-50">
                              Details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Debt by Type - Monthly Summary */}
            <Collapsible open={isDebtSummaryExpanded} onOpenChange={setIsDebtSummaryExpanded}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">
                        Debt by Type - Monthly Summary
                        <span className="ml-2 text-sm text-gray-500">JAN - DEC 2025</span>
                      </CardTitle>
                      <Button variant="ghost" size="sm">
                        {isDebtSummaryExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Label className="text-sm">Period:</Label>
                        <Button variant="outline" size="sm" className="text-xs">
                          <ChevronLeft className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium">JAN - DEC 2025</span>
                        <Button variant="outline" size="sm" className="text-xs">
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Label className="text-sm">View:</Label>
                        <div className="flex border rounded-md">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={`px-3 py-1 text-xs ${summaryViewMode === 'table' ? 'bg-gray-200' : ''}`}
                            onClick={() => setSummaryViewMode('table')}
                          >
                            Table
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={`px-3 py-1 text-xs ${summaryViewMode === 'chart' ? 'bg-gray-200' : ''}`}
                            onClick={() => setSummaryViewMode('chart')}
                          >
                            Chart
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Monthly Summary Table */}
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-500">
                            <TableHead className="font-bold text-white py-2 px-4 border-r border-gray-400 text-left">DEBT BY TYPE</TableHead>
                            {['JUL 2025', 'AUG 2025', 'SEP 2025', 'OCT 2025', 'NOV 2025', 'DEC 2025'].map((month, index) => (
                              <TableHead key={month} className={`text-center font-bold text-white py-2 px-3 ${index < 5 ? 'border-r border-gray-400' : ''} text-xs`}>
                                {month}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[
                            { type: "Auto Loan", values: [18450, 18450, 18450, 18450, 18450, 18450], interest: [80, 80, 80, 80, 80, 80] },
                            { type: "Credit Card", values: [4307, 4307, 4307, 4307, 4307, 4307], interest: [90, 90, 90, 90, 90, 90] },
                            { type: "Line Of Credit", values: [5200, 3100, 2500, 1900, 1300, 700], interest: [54, 32, 26, 20, 14, 7] }
                          ].map((row, index) => (
                            <TableRow key={row.type} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                              <TableCell className="font-semibold text-gray-800 bg-gray-200 py-2 px-4 border-r border-gray-300 text-sm">
                                {row.type}
                              </TableCell>
                              {row.values.map((value, monthIndex) => (
                                <TableCell key={monthIndex} className="text-center py-2 px-2 border-r border-gray-200">
                                  <div className="space-y-0.5">
                                    <div className="text-sm font-bold text-gray-900">
                                      {formatCurrency(value)}
                                    </div>
                                    <div className="text-xs text-red-600 italic">
                                      ${row.interest[monthIndex]}
                                    </div>
                                  </div>
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
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
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <Input type="number" step="0.01" placeholder="0.00" className="pl-8" {...field} />
                        </div>
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

        {/* Notes Dialog */}
        <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Notes - {selectedAccountForNotes}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                {selectedAccountForNotes && accountNotes[selectedAccountForNotes]?.map((note, index) => (
                  <div key={index} className="flex items-start justify-between p-2 bg-gray-50 rounded">
                    <p className="text-sm text-gray-700 flex-1">{note}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeNote(selectedAccountForNotes, index)}
                      className="ml-2 h-auto p-1"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {(!selectedAccountForNotes || !accountNotes[selectedAccountForNotes]?.length) && (
                  <p className="text-sm text-gray-500 italic">No notes yet</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-note">Add New Note</Label>
                <Textarea
                  id="new-note"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Enter a note about this account..."
                  rows={3}
                />
                <Button onClick={addNote} disabled={!newNote.trim()} className="w-full">
                  Add Note
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}