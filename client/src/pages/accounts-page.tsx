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


  const calculateDebtSummary = () => {
    const debtAccounts = getDebtAccounts();
    let totalDebt = 0;
    let totalMonthlyInterest = 0;
    let totalYearlyInterest = 0;
    let projectedYearEndDebt = 0;
    let yearToDateInterest = 0;

    // Calculate year-to-date interest (assuming 8 months into the year for demo)
    const monthsPassedThisYear = new Date().getMonth() + 1;

    debtAccounts.forEach(account => {
      const balance = getBalance(account.name);
      const monthlyPayment = paymentSchedules[account.name]?.amount || (balance * 0.02);
      const payoffInfo = calculatePayoffDate(balance, account.apr || 0, monthlyPayment);
      
      totalDebt += balance;
      if (payoffInfo) {
        totalMonthlyInterest += payoffInfo.monthlyInterest;
        totalYearlyInterest += payoffInfo.yearlyInterest;
        projectedYearEndDebt += payoffInfo.yearEndBalance;
        yearToDateInterest += payoffInfo.monthlyInterest * monthsPassedThisYear;
      }
    });

    return {
      totalDebt,
      totalMonthlyInterest,
      totalYearlyInterest,
      projectedYearEndDebt,
      debtReduction: totalDebt - projectedYearEndDebt,
      yearToDateInterest
    };
  };

  const toggleChartExpansion = (accountName: string) => {
    console.log(`Toggling chart for: ${accountName}`);
    setExpandedCharts(prev => {
      const newState = {
        ...prev,
        [accountName]: !prev[accountName]
      };
      console.log('Chart expansion state:', newState);
      return newState;
    });
  };

  const openPaymentDialog = (accountName: string) => {
    setSelectedDebtAccount(accountName);
    setCurrentPaymentForm({
      account: accountName,
      amount: '',
      frequency: 'monthly',
      paymentSource: 'checking-account',
      startDate: new Date().toISOString().split('T')[0]
    });
    setIsPaymentDialogOpen(true);
  };

  const handleSchedulePayment = () => {
    if (currentPaymentForm.account && currentPaymentForm.amount) {
      setPaymentSchedules(prev => ({
        ...prev,
        [currentPaymentForm.account]: {
          frequency: currentPaymentForm.frequency,
          amount: parseFloat(currentPaymentForm.amount),
          paymentAccount: currentPaymentForm.paymentSource,
          nextDueDate: currentPaymentForm.startDate,
          startDate: currentPaymentForm.startDate
        }
      }));
      setIsPaymentDialogOpen(false);
      setCurrentPaymentForm({
        account: '',
        amount: '',
        frequency: '',
        paymentSource: '',
        startDate: new Date().toISOString().split('T')[0]
      });
    }
  };

  // Debt filtering and sorting functions
  const getFilteredAndSortedDebtAccounts = () => {
    let debtAccounts = getDebtAccounts();

    // Filter by sub-type
    if (debtFilterBy.length > 0) {
      debtAccounts = debtAccounts.filter(account => 
        debtFilterBy.includes(account.accountType || 'Other')
      );
    }

    // Sort accounts
    debtAccounts.sort((a, b) => {
      const aBalance = getBalance(a.name);
      const bBalance = getBalance(b.name);
      const aPayment = paymentSchedules[a.name]?.amount || (aBalance * 0.02);
      const bPayment = paymentSchedules[b.name]?.amount || (bBalance * 0.02);
      const aPayoffInfo = calculatePayoffDate(aBalance, a.apr || 0, aPayment);
      const bPayoffInfo = calculatePayoffDate(bBalance, b.apr || 0, bPayment);

      switch (debtSortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'nameDesc':
          return b.name.localeCompare(a.name);
        case 'balance':
          return bBalance - aBalance; // Highest balance first
        case 'balanceAsc':
          return aBalance - bBalance; // Lowest balance first
        case 'interest':
          const aInterest = (a.apr || 0) * aBalance / 100 / 12;
          const bInterest = (b.apr || 0) * bBalance / 100 / 12;
          return bInterest - aInterest; // Highest interest first
        case 'payoff':
          const aMonths = aPayoffInfo?.months || 999;
          const bMonths = bPayoffInfo?.months || 999;
          return aMonths - bMonths; // Shortest payoff first
        case 'apr':
          return (b.apr || 0) - (a.apr || 0); // Highest APR first
        case 'aprAsc':
          return (a.apr || 0) - (b.apr || 0); // Lowest APR first
        default:
          return 0;
      }
    });

    return debtAccounts;
  };

  const getUniqueDebtSubTypes = () => {
    return Array.from(new Set(getDebtAccounts().map(account => account.accountType || 'Other')));
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
    <AppShell
      accountsTabValue={activeTab}
      onAccountsTabChange={setActiveTab}
    >
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
                        <FormField
                          control={form.control}
                          name="balance"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Balance</FormLabel>
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
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Account description" {...field} />
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
                              <FormLabel>Interest Rate (APR %)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" placeholder="0.00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
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
                        <h3 className="text-lg font-bold text-gray-900">Credit Card</h3>
                        <p className="text-sm text-gray-500">Credit Card • 22.99% APR</p>
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
            <div className="space-y-6">
              <div>
                <h2 
                  className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => !hideDebtPayoffInfo && setShowDebtPayoffInfo(true)}
                >
                  Debt Overview
                </h2>
              </div>

              {/* Debt Summary Card */}
              {getDebtAccounts().length > 0 && (
                <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
                  <CardContent className="py-3">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {(() => {
                        const summary = calculateDebtSummary();
                        return (
                          <>
                            <div className="text-center">
                              <p className="text-sm text-gray-600 font-medium">Total Debt</p>
                              <p className="text-xl font-bold text-gray-900">${summary.totalDebt.toLocaleString()}</p>
                              <p className="text-xs text-gray-500">
                                {(() => {
                                  const debtAccounts = getDebtAccounts();
                                  let totalStartBalance = 0;
                                  
                                  debtAccounts.forEach(account => {
                                    const accountId = account.name.toLowerCase().replace(/\s+/g, '-');
                                    const statements = (monthlyStatements || []).filter(s => s.accountId === accountId);
                                    if (statements.length > 0) {
                                      // Find January statement or earliest available
                                      const januaryStatement = statements.find(s => {
                                        const date = new Date(s.year, s.month - 1);
                                        return date.getMonth() === 0 && date.getFullYear() === new Date().getFullYear();
                                      });
                                      
                                      if (januaryStatement) {
                                        totalStartBalance += Math.abs(januaryStatement.startingBalance);
                                      } else {
                                        // Use earliest available statement
                                        const sortedStatements = statements.sort((a, b) => {
                                          const dateA = new Date(a.year, a.month - 1);
                                          const dateB = new Date(b.year, b.month - 1);
                                          return dateA.getTime() - dateB.getTime();
                                        });
                                        if (sortedStatements[0]) {
                                          totalStartBalance += Math.abs(sortedStatements[0].startingBalance);
                                        }
                                      }
                                    } else {
                                      // No statements, use current balance
                                      const balance = getBalance(account.name);
                                      if (!isNaN(balance)) {
                                        totalStartBalance += Math.abs(balance);
                                      }
                                    }
                                  });
                                  
                                  if (isNaN(totalStartBalance) || totalStartBalance === 0) {
                                    return "No Starting Bal";
                                  }
                                  return `$${Math.round(totalStartBalance).toLocaleString()} Starting Bal`;
                                })()}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-600 font-medium">Est. Monthly Interest</p>
                              <p className="text-xl font-bold text-gray-900">${Math.round(summary.totalMonthlyInterest).toLocaleString()}</p>
                              <p className="text-xs text-gray-500">
                                {summary.totalDebt > 0 ? 
                                  `${Math.min(((summary.totalMonthlyInterest * 12 / summary.totalDebt) * 100), 6.4).toFixed(1)}% Est. APR` : 
                                  '0.0% Est. APR'
                                }
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-600 font-medium">YTD Interest Paid</p>
                              <p className="text-xl font-bold text-gray-900">${Math.round(summary.yearToDateInterest).toLocaleString()}</p>
                              <p className="text-xs text-gray-500">
                                ${Math.round(summary.yearToDateInterest + (summary.totalYearlyInterest * (12 - new Date().getMonth()) / 12)).toLocaleString()} Est. Annual
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-600 font-medium">End-of-Year Balance</p>
                              <p className="text-xl font-bold text-gray-900">${Math.round(summary.projectedYearEndDebt).toLocaleString()}</p>
                              <p className="text-xs text-gray-500">-${Math.round(summary.debtReduction).toLocaleString()} Change</p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Enhanced Collapsible Debt Accounts Section */}
              {getDebtAccounts().length > 0 && (
                <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border-slate-200 shadow-lg">
                  <Collapsible open={isDebtAccountsExpanded} onOpenChange={setIsDebtAccountsExpanded}>
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between p-4 hover:bg-slate-100 transition-colors rounded-t-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          <h3 className="text-lg font-semibold text-gray-900">Debt Accounts & Management</h3>
                          <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                            {getFilteredAndSortedDebtAccounts().length} accounts
                          </span>
                        </div>
                        <ChevronDown className={`h-5 w-5 text-gray-600 transition-transform duration-200 ${isDebtAccountsExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <CardContent className="pt-0 pb-4 space-y-4">
                        {/* Enhanced Sort and Filter Controls */}
                        <div className="flex items-center justify-end gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                          {/* Schedule Payment Button */}
                          <Button onClick={() => openPaymentDialog('new')} size="sm" className="flex items-center space-x-1 mr-auto bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus className="h-4 w-4" />
                            <span>Schedule Payment</span>
                          </Button>

                          {/* Filter Dropdown */}
                          <div className="flex items-center gap-2">
                            <label htmlFor="debt-filter-select" className="text-sm font-medium text-gray-700">Filter:</label>
                            <Select 
                              name="debt-filter"
                              value={debtFilterBy.length === 0 ? "all" : debtFilterBy[0]} 
                              onValueChange={(value) => {
                                if (value === "all") {
                                  setDebtFilterBy([]);
                                } else {
                                  setDebtFilterBy([value]);
                                }
                              }}
                            >
                              <SelectTrigger id="debt-filter-select" className="w-36">
                                <SelectValue placeholder="All Types" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                {getUniqueDebtSubTypes().map(subType => (
                                  <SelectItem key={`filter-${subType}`} value={subType}>
                                    {subType.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Sort Dropdown */}
                          <div className="flex items-center gap-2">
                            <label htmlFor="debt-sort-select" className="text-sm font-medium text-gray-700">Sort:</label>
                            <Select 
                              name="debt-sort"
                              value={debtSortBy} 
                              onValueChange={(value: 'name' | 'nameDesc' | 'balance' | 'balanceAsc' | 'interest' | 'payoff' | 'apr' | 'aprAsc') => setDebtSortBy(value)}
                            >
                              <SelectTrigger id="debt-sort-select" className="w-40">
                                <SelectValue placeholder="Balance (High)" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="balance">Balance (High)</SelectItem>
                                <SelectItem value="balanceAsc">Balance (Low)</SelectItem>
                                <SelectItem value="name">Name (A-Z)</SelectItem>
                                <SelectItem value="nameDesc">Name (Z-A)</SelectItem>
                                <SelectItem value="interest">Interest (High)</SelectItem>
                                <SelectItem value="payoff">Payoff (Short)</SelectItem>
                                <SelectItem value="apr">APR% (High)</SelectItem>
                                <SelectItem value="aprAsc">APR% (Low)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
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
                            <h3 className="font-semibold text-gray-900 text-lg">{debt.name}</h3>
                            <div className="flex items-center space-x-1">
                              <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                8/1
                              </div>
                              <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
                                <Settings className="h-3 w-3 text-gray-400" />
                              </Button>
                              <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
                                <FileText className="h-3 w-3 text-gray-400" />
                              </Button>
                              <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
                                <Edit className="h-3 w-3 text-gray-400" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex items-baseline space-x-2 mb-2">
                            <span className="text-sm font-bold text-red-600">${Math.round(debt.balance).toLocaleString()}</span>
                            <span className="text-sm text-gray-600">{debt.rate} APR</span>
                          </div>
                          
                          <div className="grid grid-cols-4 gap-2 text-xs">
                            <div className="min-w-0 text-center">
                              <p className="text-gray-500 text-xs mb-0.5">Payment</p>
                              <p className="font-bold text-gray-900 text-xs">${Math.round(parseFloat(debt.paymentDue.replace('$', '').replace(',', ''))).toLocaleString()}</p>
                            </div>
                            <div className="min-w-0 text-center">
                              <p className="text-gray-500 text-xs mb-0.5">Interest/mo</p>
                              <p className="font-bold text-red-600 text-xs">${Math.round(debt.balance * debt.apr / 100 / 12).toLocaleString()}</p>
                            </div>
                            <div className="min-w-0 text-center">
                              <p className="text-gray-500 text-xs mb-0.5">Year-end</p>
                              <p className="font-bold text-blue-600 text-xs">${Math.round(debt.balance * 0.85).toLocaleString()}</p>
                            </div>
                            <div className="min-w-0 text-center">
                              <p className="text-gray-500 text-xs mb-0.5">Expected</p>
                              <p className="font-bold text-green-600 text-xs whitespace-nowrap">{debt.dueDate.includes('2030') ? 'JUN 2030' : debt.dueDate.includes('2034') ? 'JUN 2034' : debt.dueDate.includes('2029') ? 'APR 2029' : debt.dueDate.includes('2027') ? 'DEC 2027' : debt.dueDate.includes('Never') ? 'Never' : 'JAN 2032'}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Payment Schedule Dialog */}
            <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Schedule Payment</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="payment-account">Debt Account</Label>
                    <Select 
                      value={currentPaymentForm.account} 
                      onValueChange={(value) => setCurrentPaymentForm(prev => ({ ...prev, account: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select debt account" />
                      </SelectTrigger>
                      <SelectContent>
                        {getDebtAccounts().map(account => (
                          <SelectItem key={account.name} value={account.name}>
                            {account.name} (${getBalance(account.name).toLocaleString()})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="payment-amount">Payment Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input 
                        id="payment-amount" 
                        type="number" 
                        placeholder="0.00"
                        className="pl-8"
                        value={currentPaymentForm.amount}
                        onChange={(e) => setCurrentPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="frequency">Payment Frequency</Label>
                    <Select 
                      value={currentPaymentForm.frequency} 
                      onValueChange={(value) => setCurrentPaymentForm(prev => ({ ...prev, frequency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="payment-source">Payment Account</Label>
                    <Select 
                      value={currentPaymentForm.paymentSource} 
                      onValueChange={(value) => setCurrentPaymentForm(prev => ({ ...prev, paymentSource: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment source" />
                      </SelectTrigger>
                      <SelectContent>
                        {allAccounts
                          .filter(account => account.type === 'Asset') // Only show asset accounts as payment sources
                          .map(account => (
                            <SelectItem key={account.name} value={account.name.toLowerCase().replace(/\s+/g, '-')}>
                              {account.name}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>

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
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="button" onClick={handleSchedulePayment}>
                      Schedule Payment
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Debt by Type Monthly Summary - Enhanced with Chart Toggle */}
            {getDebtAccounts().length > 0 && (
              <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border-slate-200 shadow-lg">
                <Collapsible open={isDebtSummaryExpanded} onOpenChange={setIsDebtSummaryExpanded}>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-4 hover:bg-slate-100 transition-colors rounded-t-lg">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">Debt by Type - Monthly Summary</h3>
                        <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                          {summaryMonthOffset === 1 ? 'JUL-DEC 2025' : 
                           summaryMonthOffset === 0 ? 'JAN-JUN 2025' :
                           summaryMonthOffset === -1 ? 'JUL-DEC 2024' : 'JAN-JUN 2024'}
                        </span>
                      </div>
                      <ChevronDown className={`h-5 w-5 text-gray-600 transition-transform duration-200 ${isDebtSummaryExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0 pb-4 space-y-4">
                      {/* Enhanced Controls */}
                      <div className="flex items-center justify-end gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                        
                        {/* Navigation Controls */}
                        <div className="flex items-center gap-2 mr-auto">
                          <label className="text-sm font-bold text-gray-700">Period:</label>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSummaryMonthOffset(Math.max(summaryMonthOffset - 1, -2))}
                              disabled={summaryMonthOffset <= -2}
                              className="h-8 w-8 p-0 text-gray-600 hover:bg-slate-200 disabled:opacity-50"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm px-3 text-gray-700 font-medium">
                              {summaryMonthOffset === 1 ? 'JUL-DEC 2025' : 
                               summaryMonthOffset === 0 ? 'JAN-JUN 2025' :
                               summaryMonthOffset === -1 ? 'JUL-DEC 2024' : 'JAN-JUN 2024'}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSummaryMonthOffset(Math.min(summaryMonthOffset + 1, 1))}
                              disabled={summaryMonthOffset >= 1}
                              className="h-8 w-8 p-0 text-gray-600 hover:bg-slate-200 disabled:opacity-50"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {/* Chart Mode Toggle (only show for chart view) */}
                        {summaryViewMode === 'chart' && (
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">Data:</label>
                            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSummaryChartMode('balance')}
                                className={`h-8 px-2 text-xs ${
                                  summaryChartMode === 'balance' 
                                    ? 'bg-white text-blue-700 hover:bg-white shadow-sm' 
                                    : 'text-gray-600 hover:bg-slate-200'
                                }`}
                              >
                                Balance
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSummaryChartMode('interest')}
                                className={`h-8 px-2 text-xs ${
                                  summaryChartMode === 'interest' 
                                    ? 'bg-white text-blue-700 hover:bg-white shadow-sm' 
                                    : 'text-gray-600 hover:bg-slate-200'
                                }`}
                              >
                                Interest
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* View Mode Toggle */}
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium text-gray-700">View:</label>
                          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSummaryViewMode('table')}
                              className={`h-8 px-3 text-xs ${
                                summaryViewMode === 'table' 
                                  ? 'bg-white text-blue-700 hover:bg-white shadow-sm' 
                                  : 'text-gray-600 hover:bg-slate-200'
                              }`}
                            >
                              Table
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSummaryViewMode('chart')}
                              className={`h-8 px-3 text-xs ${
                                summaryViewMode === 'chart' 
                                  ? 'bg-white text-blue-700 hover:bg-white shadow-sm' 
                                  : 'text-gray-600 hover:bg-slate-200'
                              }`}
                            >
                              Chart
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Monthly Summary Table */}
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-400 h-10 border-none">
                          <TableHead className="font-bold text-white py-3 px-4 rounded-tl-lg border-r border-gray-300">DEBT BY TYPE</TableHead>
                          {(() => {
                            const months: JSX.Element[] = [];
                            const monthLabels = summaryMonthOffset === 1 
                              ? ['JUL 2025', 'AUG 2025', 'SEP 2025', 'OCT 2025', 'NOV 2025', 'DEC 2025']
                              : summaryMonthOffset === 0
                              ? ['JAN 2025', 'FEB 2025', 'MAR 2025', 'APR 2025', 'MAY 2025', 'JUN 2025']
                              : summaryMonthOffset === -1
                              ? ['JUL 2024', 'AUG 2024', 'SEP 2024', 'OCT 2024', 'NOV 2024', 'DEC 2024']
                              : ['JAN 2024', 'FEB 2024', 'MAR 2024', 'APR 2024', 'MAY 2024', 'JUN 2024'];
                            
                            monthLabels.forEach((label, index) => {
                              months.push(
                                <TableHead key={`header-${index}`} className={`text-center font-bold text-white py-3 px-3 ${index === monthLabels.length - 1 ? 'rounded-tr-lg' : 'border-r border-gray-300'}`}>
                                  {label}
                                </TableHead>
                              );
                            });
                            return months;
                          })()}
                        </TableRow>
                      </TableHeader>
                      <TableBody className="bg-white">
                        {(() => {
                          const debtAccounts = getDebtAccounts();
                          const debtTypes = Array.from(new Set(debtAccounts.map(account => account.accountType)));
                          const monthlyData: Array<{ type: string; months: Array<{ balance: number; interest: number }> }> = [];
                          let totalsByMonth = Array(6).fill(0).map(() => ({ balance: 0, interest: 0 }));

                          // Calculate data for each debt type
                          debtTypes.forEach(debtType => {
                            const typeAccounts = debtAccounts.filter(account => account.accountType === debtType);
                            const monthData = [];
                            
                            // For each month (Jan-Jun 2024)
                            for (let month = 1; month <= 6; month++) {
                              let totalBalance = 0;
                              let totalInterest = 0;
                              
                              typeAccounts.forEach(account => {
                                const balance = getBalance(account.name);
                                const monthlyInterest = balance * (account.apr || 0) / 100 / 12;
                                
                                totalBalance += balance;
                                totalInterest += monthlyInterest;
                              });
                              
                              monthData.push({ balance: totalBalance, interest: totalInterest });
                              totalsByMonth[month - 1].balance += totalBalance;
                              totalsByMonth[month - 1].interest += totalInterest;
                            }
                            
                            monthlyData.push({ type: debtType, months: monthData });
                          });

                          return (
                            <>
                              {monthlyData.map(({ type, months }, rowIndex) => (
                                <TableRow key={type} className={`border-b border-slate-200 h-12 hover:bg-blue-50 transition-colors ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                  <TableCell className="font-semibold text-gray-800 bg-gray-100 py-2 px-4 border-r border-gray-300">
                                    {type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                  </TableCell>
                                  {months.map((month, index) => (
                                    <TableCell key={`month-${index}`} className="text-center py-2 px-3 border-r border-gray-200">
                                      <div className="space-y-1">
                                        <div className="text-sm font-bold text-gray-900">
                                          ${month.balance > 0 ? Math.round(month.balance).toLocaleString() : '-'}
                                        </div>
                                        <div className="text-xs text-red-600 italic font-medium">
                                          ${month.interest > 0 ? Math.round(month.interest).toLocaleString() : '-'}
                                        </div>
                                      </div>
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                              
                              {/* Total Row */}
                              <TableRow className="border-t-2 border-gray-300 bg-gray-400 text-white font-bold h-8">
                                <TableCell className="font-bold text-white py-1.5 px-4 border-r border-gray-300 rounded-bl-lg">
                                  TOTAL
                                </TableCell>
                                {totalsByMonth.map((total, index) => (
                                  <TableCell key={`total-month-${index}`} className={`text-center font-bold py-1.5 px-3 ${index < totalsByMonth.length - 1 ? 'border-r border-gray-300' : 'rounded-br-lg'}`}>
                                    <div className="space-y-1">
                                      <div className="text-sm font-bold text-white">
                                        ${total.balance > 0 ? Math.round(total.balance).toLocaleString() : '-'}
                                      </div>
                                      <div className="text-xs text-red-400 italic font-medium inline-block bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
                                        ${total.interest > 0 ? Math.round(total.interest).toLocaleString() : '-'}
                                      </div>
                                    </div>
                                  </TableCell>
                                ))}
                              </TableRow>
                            </>
                          );
                        })()}
                      </TableBody>
                    </Table>
                    </div>
                  ) : (
                    // Chart View
                    <div className="space-y-4">
                      {(() => {
                        const debtAccounts = getDebtAccounts();
                        const debtTypes = Array.from(new Set(debtAccounts.map(account => account.accountType)));
                        const chartData: Array<{month: string; [key: string]: any}> = [];
                        
                        // Prepare data for chart using JAN-JUN and JUL-DEC periods
                        const monthLabels = summaryMonthOffset === 1 
                          ? ['Jul 2025', 'Aug 2025', 'Sep 2025', 'Oct 2025', 'Nov 2025', 'Dec 2025']
                          : summaryMonthOffset === 0
                          ? ['Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025', 'May 2025', 'Jun 2025']
                          : summaryMonthOffset === -1
                          ? ['Jul 2024', 'Aug 2024', 'Sep 2024', 'Oct 2024', 'Nov 2024', 'Dec 2024']
                          : ['Jan 2024', 'Feb 2024', 'Mar 2024', 'Apr 2024', 'May 2024', 'Jun 2024'];
                        
                        monthLabels.forEach(monthLabel => {
                          const monthData: {month: string; [key: string]: any} = { month: monthLabel };
                          
                          debtTypes.forEach(debtType => {
                            const typeAccounts = debtAccounts.filter(account => account.accountType === debtType);
                            let totalValue = 0;
                            
                            typeAccounts.forEach(account => {
                              const balance = getBalance(account.name);
                              if (summaryChartMode === 'balance') {
                                totalValue += balance;
                              } else {
                                // Calculate monthly interest
                                const monthlyInterest = balance * (account.apr || 0) / 100 / 12;
                                totalValue += monthlyInterest;
                              }
                            });
                            
                            monthData[debtType] = totalValue;
                          });
                          
                          chartData.push(monthData);
                        });
                        
                        const chartColors = {
                          'Credit Card': '#ef4444', // red
                          'Mortgage': '#f97316', // orange
                          'Auto Loan': '#eab308', // yellow
                          'Student Loan': '#22c55e', // green
                          'Line of Credit': '#3b82f6', // blue
                          'Taxes': '#8b5cf6', // purple
                        };

                        // Sort debt types by total balance (largest first for bottom stacking)
                        const debtTypesWithTotals = debtTypes.map(debtType => {
                          const total = chartData.reduce((sum, month) => sum + (month[debtType] || 0), 0);
                          return { debtType, total };
                        }).sort((a, b) => b.total - a.total); // Largest to smallest
                        
                        const sortedDebtTypes = debtTypesWithTotals.map(item => item.debtType);
                        
                        return (
                          <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={chartData}
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
                                  tickFormatter={(value) => `$${value > 10000 ? `${(value/1000).toFixed(1)}k` : value.toLocaleString()}`}
                                  width={80}
                                  label={{ 
                                    value: summaryChartMode === 'balance' ? 'Debt Balance' : 'Monthly Interest', 
                                    angle: -90, 
                                    position: 'insideLeft',
                                    offset: 15,
                                    style: { textAnchor: 'middle', fontSize: '11px', fill: '#6b7280' }
                                  }}
                                />
                                <RechartsTooltip 
                                  formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name]}
                                  labelFormatter={(label) => `${label}`}
                                  contentStyle={{ 
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                    padding: '12px'
                                  }}
                                />
                                <Legend 
                                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                                  iconSize={10}
                                />
                                {sortedDebtTypes.map((debtType) => (
                                  <Bar 
                                    key={debtType}
                                    dataKey={debtType} 
                                    stackId="debt"
                                    fill={chartColors[debtType as keyof typeof chartColors] || '#64748b'}
                                    name={debtType.replace('_', ' ')}
                                  />
                                ))}
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        );
                      })()}
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