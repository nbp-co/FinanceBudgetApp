import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Building, CreditCard, Edit, Settings, Save, Minus, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, TrendingDown, TrendingUp, DollarSign, Calculator, Calendar, Target, Zap, CalendarDays, CheckCircle2 } from "lucide-react";
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
  
  // Statements tab state
  const [selectedMonths, setSelectedMonths] = useState<string[]>(["2024-11", "2024-10", "2024-09"]);
  const [selectedAccountTypes, setSelectedAccountTypes] = useState<string[]>(['Asset', 'Debt']);
  const [selectedSubTypes, setSelectedSubTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'type'>('type');
  const [isStatementsOpen, setIsStatementsOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const accountsPerPage = 5;

  // Debt payoff tab state
  const [paymentSchedules, setPaymentSchedules] = useState<{ [accountName: string]: { frequency: string; amount: number; paymentAccount: string; nextDueDate: string } }>({});
  const [expandedCharts, setExpandedCharts] = useState<{ [accountName: string]: boolean }>({});
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedDebtAccount, setSelectedDebtAccount] = useState<string | null>(null);
  
  // Debt sort/filter state
  const [debtSortBy, setDebtSortBy] = useState<'name' | 'nameDesc' | 'balance' | 'balanceAsc' | 'interest' | 'payoff'>('balance');
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

  // Debt summary view mode state
  const [summaryViewMode, setSummaryViewMode] = useState<'table' | 'chart'>('table');
  const [summaryChartMode, setSummaryChartMode] = useState<'balance' | 'interest'>('balance');
  const [summaryMonthOffset, setSummaryMonthOffset] = useState(1); // 1 = JUL-DEC 2025, 0 = JAN-JUN 2025, -1 = JUL-DEC 2024, -2 = JAN-JUN 2024

  // Mock monthly statements data for debt overview calculation
  const monthlyStatements = [
    { id: 1, accountId: "credit-card", year: 2024, month: 1, startingBalance: 2500.0 },
    { id: 2, accountId: "mortgage", year: 2024, month: 1, startingBalance: 285000.0 },
    { id: 3, accountId: "auto-loan", year: 2024, month: 1, startingBalance: 18500.0 },
    { id: 4, accountId: "student-loan", year: 2024, month: 1, startingBalance: 45000.0 },
  ];

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
    'Student Loan': '#22c55e', // bright green (updated from dull green/grey)
    'Line of Credit': '#10b981', // emerald green (updated from dull green/grey)
    'Taxes': '#8b5cf6', // purple
    'Savings': '#22c55e', // green
    'Money Market': '#3b82f6', // blue
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
    setSelectedAccountTypes(prev => {
      const newTypes = prev.includes(accountType) 
        ? prev.filter(t => t !== accountType)
        : [...prev, accountType];
      
      // Clear sub-type selections that are no longer available
      const newAvailableSubTypes = Array.from(new Set(
        allAccounts
          .filter(account => newTypes.includes(account.type))
          .map(account => account.accountType)
      ));
      setSelectedSubTypes(current => 
        current.filter(subType => newAvailableSubTypes.includes(subType))
      );
      
      return newTypes;
    });
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

  // Debt payoff helper functions
  const getDebtAccounts = () => allAccounts.filter(account => account.type === 'Debt');
  
  const calculatePayoffProjection = (balance: number, apr: number, monthlyPayment: number) => {
    const months = [];
    let currentBalance = balance;
    const monthlyRate = apr / 100 / 12;
    
    // Previous 3 months (mock data for now)
    for (let i = 3; i > 0; i--) {
      const prevBalance = balance * (1 + (i * 0.02)); // Mock previous balances
      months.push({
        month: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        balance: prevBalance,
        isPast: true
      });
    }
    
    // Current month
    months.push({
      month: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
      balance: currentBalance,
      isPast: false
    });
    
    // Future 6 months projection
    for (let i = 1; i <= 6; i++) {
      const interestCharge = currentBalance * monthlyRate;
      currentBalance = Math.max(0, currentBalance + interestCharge - monthlyPayment);
      months.push({
        month: new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        balance: currentBalance,
        isPast: false
      });
      
      if (currentBalance <= 0) break;
    }
    
    return months;
  };
  
  const calculatePayoffDate = (balance: number, apr: number, monthlyPayment: number) => {
    if (monthlyPayment <= 0) return null;
    
    let currentBalance = balance;
    const monthlyRate = apr / 100 / 12;
    let months = 0;
    let totalInterestPaid = 0;
    
    while (currentBalance > 0.01 && months < 600) { // Max 50 years
      const interestCharge = currentBalance * monthlyRate;
      const principalPayment = Math.min(monthlyPayment - interestCharge, currentBalance);
      
      if (principalPayment <= 0) return null; // Payment too low to cover interest
      
      totalInterestPaid += interestCharge;
      currentBalance -= principalPayment;
      months++;
    }
    
    const payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + months);
    
    // Calculate end-of-year balance (12 months from now)
    let yearEndBalance = balance;
    const monthlyRate12 = apr / 100 / 12;
    for (let i = 0; i < 12; i++) {
      const interestCharge = yearEndBalance * monthlyRate12;
      const principalPayment = Math.min(monthlyPayment - interestCharge, yearEndBalance);
      if (principalPayment <= 0) break;
      yearEndBalance = Math.max(0, yearEndBalance - principalPayment);
      if (yearEndBalance <= 0) break;
    }
    
    return {
      months,
      date: payoffDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
      totalInterest: totalInterestPaid,
      monthlyInterest: balance * monthlyRate,
      yearEndBalance: yearEndBalance,
      yearlyInterest: balance * monthlyRate * 12
    };
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
      paymentSource: 'checking',
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
        debtFilterBy.includes(account.subType || 'Other')
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
        default:
          return 0;
      }
    });

    return debtAccounts;
  };

  const getUniqueDebtSubTypes = () => {
    return Array.from(new Set(getDebtAccounts().map(account => account.subType || 'Other')));
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
          <div className="flex justify-center">
            <TabsList className="grid grid-cols-3 max-w-lg">
              <TabsTrigger value="accounts">My Accounts</TabsTrigger>
              <TabsTrigger value="statements">Statements</TabsTrigger>
              <TabsTrigger value="debt-payoff">Debt Payoff</TabsTrigger>
            </TabsList>
          </div>
          
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
                      {/* Month Selection */}
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
                                {sortBy === 'type' ? 'Type (Debt → Asset)' : 'Name (A → Z)'}
                                <ChevronDown className="h-4 w-4 ml-2" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-48 p-2" align="start">
                              <RadioGroup value={sortBy} onValueChange={handleSortChange} className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="type" id="acc-sort-type" />
                                  <Label htmlFor="acc-sort-type" className="text-sm cursor-pointer">
                                    Type (Debt → Asset)
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="name" id="acc-sort-name" />
                                  <Label htmlFor="acc-sort-name" className="text-sm cursor-pointer">
                                    Name (A → Z)
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
                                ${(() => {
                                  const debtAccounts = getDebtAccounts();
                                  let totalStartBalance = 0;
                                  
                                  debtAccounts.forEach(account => {
                                    const statements = (monthlyStatements || []).filter(s => s.accountId === account.id);
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
                                      totalStartBalance += Math.abs(account.balance);
                                    }
                                  });
                                  
                                  return Math.round(totalStartBalance).toLocaleString();
                                })()} Starting Bal
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
                  <Collapsible defaultOpen={true}>
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between p-4 hover:bg-slate-100 transition-colors rounded-t-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          <h3 className="text-lg font-semibold text-gray-900">Debt Accounts & Management</h3>
                          <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                            {getFilteredAndSortedDebtAccounts().length} accounts
                          </span>
                        </div>
                        <ChevronDown className="h-5 w-5 text-gray-600" />
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
                                    {subType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
                              onValueChange={(value: 'name' | 'nameDesc' | 'balance' | 'balanceAsc' | 'interest' | 'payoff') => setDebtSortBy(value)}
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
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Debt Account Cards */}
                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {getFilteredAndSortedDebtAccounts().map(account => {
                  const balance = getBalance(account.name);
                  const monthlyPayment = paymentSchedules[account.name]?.amount || (balance * 0.02); // Default 2% of balance
                  const payoffInfo = calculatePayoffDate(balance, account.apr || 0, monthlyPayment);
                  const projectionData = calculatePayoffProjection(balance, account.apr || 0, monthlyPayment);
                  
                  return (
                    <Card key={account.name} className="overflow-hidden">
                      <CardHeader className="pb-2 px-4 pt-3">
                        <div className="flex items-center justify-between">
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <CardTitle className="text-base truncate">{account.name}</CardTitle>
                              {/* Payment Scheduled Indicator */}
                              {paymentSchedules[account.name] && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <div className="flex items-center space-x-1">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        <span className="text-xs font-medium text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">
                                          Auto
                                        </span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Payment scheduled: ${paymentSchedules[account.name]?.amount?.toLocaleString() || Math.round(monthlyPayment).toLocaleString()}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                            <div className="flex items-center space-x-3 mt-1">
                              <p className="text-xs text-gray-600">
                                <span className="font-semibold text-red-600">${balance.toLocaleString()}</span>
                              </p>
                              {account.apr && <p className="text-xs text-gray-600 whitespace-nowrap">{account.apr}% APR</p>}
                            </div>
                          </div>
                          
                          {/* Blue Payment Box - simplified */}
                          <div className="p-1.5 border border-blue-200 bg-blue-50 rounded text-xs mx-3 min-w-[120px] text-center">
                            <p className="font-medium text-blue-900 flex items-center justify-center gap-1">
                              ${Math.round(monthlyPayment).toLocaleString()} on {account.dueDate ? `${account.dueDate}th` : 'TBD'}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-1 flex-shrink-0">
                            <Button
                              id={`chart-toggle-${account.name.replace(/\s+/g, '-').toLowerCase()}`}
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleChartExpansion(account.name);
                              }}
                            >
                              <TrendingDown className="h-3 w-3" />
                            </Button>
                            <Button
                              id={`edit-payment-${account.name.replace(/\s+/g, '-').toLowerCase()}`}
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                openPaymentDialog(account.name);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="px-4 pb-3">
                        {/* Compact Payment Schedule Info - Horizontal Layout */}
                        <div className="flex justify-between items-start text-xs">
                          <div className="space-y-1">
                            <p className="text-gray-500">Payment</p>
                            <p className="font-semibold">${Math.round(monthlyPayment).toLocaleString()}</p>
                          </div>
                          
                          {payoffInfo && (
                            <>
                              <div className="space-y-1 text-center">
                                <p className="text-gray-500">Interest/mo</p>
                                <p className="font-semibold text-red-600">${Math.round(payoffInfo.monthlyInterest).toLocaleString()}</p>
                              </div>
                              
                              <div className="space-y-1 text-center">
                                <p className="text-gray-500">Year-end</p>
                                <p className="font-semibold text-blue-600">${Math.round(payoffInfo.yearEndBalance).toLocaleString()}</p>
                              </div>
                              
                              <div className="space-y-1 text-right">
                                <p className="text-gray-500">Expected</p>
                                <p className="font-semibold text-green-600">
                                  {new Date(Date.now() + payoffInfo.months * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                </p>
                              </div>
                            </>
                          )}
                          
                          {!payoffInfo && (
                            <div className="col-span-2">
                              <p className="text-xs text-red-600">⚠️ Payment too low</p>
                              <p className="text-xs text-gray-500">Need: ${Math.round((balance * (account.apr || 0)) / 100 / 12).toLocaleString()}/mo interest</p>
                            </div>
                          )}
                        </div>

                        {/* Compact Chart */}
                        {(() => {
                          const isExpanded = expandedCharts[account.name];
                          const hasData = projectionData && projectionData.length > 0;
                          console.log(`Chart render check for ${account.name}:`, { isExpanded, hasData, projectionDataLength: projectionData?.length });
                          return isExpanded && hasData;
                        })() && (
                          <div className="mt-2 space-y-3" key={`chart-container-${account.name}`}>
                            <div className="h-32 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart 
                                  data={projectionData} 
                                  key={`line-chart-${account.name}-${balance}`}
                                >
                                  <XAxis 
                                    dataKey="month" 
                                    tick={{ fontSize: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                  />
                                  <YAxis 
                                    tick={{ fontSize: 10 }}
                                    tickFormatter={(value) => {
                                      if (value < 10000) {
                                        return `$${value.toLocaleString()}`;
                                      } else {
                                        return `$${(value/1000).toFixed(1)}k`;
                                      }
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={60}
                                    label={{ 
                                      value: 'Balance', 
                                      angle: -90, 
                                      position: 'insideLeft',
                                      offset: 10,
                                      style: { textAnchor: 'middle', fontSize: '9px', fill: '#6b7280' }
                                    }}
                                    domain={(() => {
                                      const values = projectionData.map(d => d.balance);
                                      const minValue = Math.min(...values);
                                      const maxValue = Math.max(...values);
                                      const padding = (maxValue - minValue) * 0.1 || maxValue * 0.1;
                                      return [
                                        Math.max(0, Math.floor((minValue - padding) / 1000) * 1000),
                                        Math.ceil((maxValue + padding) / 1000) * 1000
                                      ];
                                    })()}
                                  />
                                  <RechartsTooltip 
                                    formatter={(value) => [`$${value.toLocaleString()}`, 'Balance']}
                                    labelFormatter={(label) => `${label}`}
                                  />
                                  <Line 
                                    type="monotone" 
                                    dataKey="balance" 
                                    stroke="#ef4444"
                                    strokeWidth={2}
                                    dot={(props) => {
                                      const { payload } = props;
                                      return (
                                        <circle
                                          {...props}
                                          fill={payload?.isPast ? "#6b7280" : "#ef4444"}
                                          stroke={payload?.isPast ? "#6b7280" : "#ef4444"}
                                          strokeWidth={1}
                                          r={2}
                                        />
                                      );
                                    }}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>

                            {/* Payment Summary Cards */}
                            <div className="grid grid-cols-3 gap-2">
                              <div className="p-2 bg-blue-50 border border-blue-200 rounded text-center">
                                <p className="text-xs text-blue-600 font-medium">YTD Payments</p>
                                <p className="text-sm font-bold text-blue-800">
                                  ${(() => {
                                    const monthsPassed = new Date().getMonth() + 1;
                                    return Math.round(monthlyPayment * monthsPassed).toLocaleString();
                                  })()}
                                </p>
                              </div>
                              
                              <div className="p-2 bg-green-50 border border-green-200 rounded text-center">
                                <p className="text-xs text-green-600 font-medium">Auto-Payments</p>
                                <p className="text-sm font-bold text-green-800">
                                  {paymentSchedules[account.name] ? 
                                    `$${Math.round(paymentSchedules[account.name].amount).toLocaleString()}` : 
                                    '$0'
                                  }
                                </p>
                              </div>
                              
                              <div className="p-2 bg-purple-50 border border-purple-200 rounded text-center">
                                <p className="text-xs text-purple-600 font-medium">Add'l Payments</p>
                                <p className="text-sm font-bold text-purple-800">
                                  ${(() => {
                                    const scheduledAmount = paymentSchedules[account.name]?.amount || 0;
                                    const additionalAmount = Math.max(0, monthlyPayment - scheduledAmount);
                                    return Math.round(additionalAmount).toLocaleString();
                                  })()}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                        })}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              )}
              
              {getFilteredAndSortedDebtAccounts().length === 0 && getDebtAccounts().length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <TrendingDown className="h-12 w-12 mx-auto" />
                    </div>
                    <p className="text-gray-600 text-lg">No debt accounts found</p>
                    <p className="text-gray-500 text-sm">Add debt accounts in the My Accounts tab to track payoff progress</p>
                  </CardContent>
                </Card>
              )}

              {getFilteredAndSortedDebtAccounts().length === 0 && getDebtAccounts().length > 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-600">No accounts match the current filters</p>
                    <Button 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => {
                        setDebtFilterBy([]);
                      }}
                    >
                      Clear Filters
                    </Button>
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
                        <SelectItem value="checking">Checking Account</SelectItem>
                        <SelectItem value="business-checking">Business Checking</SelectItem>
                        <SelectItem value="savings">Savings Account</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="start-date">Start Date</Label>
                    <div className="relative">
                      <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input 
                        id="start-date" 
                        type="date" 
                        placeholder="Select start date"
                        className="pl-10"
                        value={currentPaymentForm.startDate}
                        onChange={(e) => setCurrentPaymentForm(prev => ({ ...prev, startDate: e.target.value }))}
                      />
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
                <Collapsible defaultOpen={true}>
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
                      <ChevronDown className="h-5 w-5 text-gray-600" />
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0 pb-4 space-y-4">
                      {/* Enhanced Controls */}
                      <div className="flex items-center justify-end gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                        
                        {/* Navigation Controls */}
                        <div className="flex items-center gap-2 mr-auto">
                          <label className="text-sm font-medium text-gray-700">Period:</label>
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

                      {/* Table and Chart Content */}
                      {summaryViewMode === 'table' ? (
                    <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
                      <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-400 h-10 border-none">
                          <TableHead className="font-bold text-white py-3 px-4 rounded-tl-lg border-r border-gray-300">DEBT BY TYPE</TableHead>
                          {(() => {
                            const months = [];
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
                              <TableRow className="border-t-2 border-gray-300 bg-gray-400 text-white font-bold h-12">
                                <TableCell className="font-bold text-white py-3 px-4 border-r border-gray-300 rounded-bl-lg">
                                  TOTAL
                                </TableCell>
                                {totalsByMonth.map((total, index) => (
                                  <TableCell key={`total-month-${index}`} className={`text-center font-bold py-3 px-3 ${index < totalsByMonth.length - 1 ? 'border-r border-gray-300' : 'rounded-br-lg'}`}>
                                    <div className="space-y-1">
                                      <div className="text-sm font-bold text-white">
                                        ${total.balance > 0 ? Math.round(total.balance).toLocaleString() : '-'}
                                      </div>
                                      <div className="text-xs text-red-400 italic font-medium">
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
                        const chartData = [];
                        
                        // Prepare data for chart using JAN-JUN and JUL-DEC periods
                        const monthLabels = summaryMonthOffset === 1 
                          ? ['Jul 2025', 'Aug 2025', 'Sep 2025', 'Oct 2025', 'Nov 2025', 'Dec 2025']
                          : summaryMonthOffset === 0
                          ? ['Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025', 'May 2025', 'Jun 2025']
                          : summaryMonthOffset === -1
                          ? ['Jul 2024', 'Aug 2024', 'Sep 2024', 'Oct 2024', 'Nov 2024', 'Dec 2024']
                          : ['Jan 2024', 'Feb 2024', 'Mar 2024', 'Apr 2024', 'May 2024', 'Jun 2024'];
                        
                        monthLabels.forEach(monthLabel => {
                          const monthData: any = { month: monthLabel };
                          
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
                  )}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            )}
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

        {/* Debt Payoff Info Popup */}
        <Dialog open={showDebtPayoffInfo} onOpenChange={setShowDebtPayoffInfo}>
          <DialogContent className="sm:max-w-md animate-in fade-in-0 zoom-in-95 duration-300">
            <DialogHeader>
              <DialogTitle className="text-blue-600">Debt Overview</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600">
                Manage payment schedules and track debt reduction progress. Use this section to:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Schedule automatic payments for debt accounts</li>
                <li>View debt payoff projections and timelines</li>
                <li>Track interest payments and debt reduction</li>
                <li>Analyze debt payoff strategies</li>
              </ul>
              
              <div className="flex items-center space-x-2 pt-4">
                <Checkbox 
                  id="hide-info"
                  checked={hideDebtPayoffInfo}
                  onCheckedChange={(checked) => {
                    const hide = checked === true;
                    setHideDebtPayoffInfo(hide);
                    localStorage.setItem('hideDebtPayoffInfo', hide.toString());
                  }}
                />
                <Label htmlFor="hide-info" className="text-sm text-gray-600">
                  Don't show this again
                </Label>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={() => setShowDebtPayoffInfo(false)}>
                  Got it
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}