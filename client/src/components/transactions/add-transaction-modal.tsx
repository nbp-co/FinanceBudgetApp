import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import type { Account, Category } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
  editTransaction?: any; // Transaction to edit (if in edit mode)
}

export function AddTransactionModal({ isOpen, onClose, defaultDate, editTransaction }: AddTransactionModalProps) {
  const [transactionType, setTransactionType] = useState<"INCOME" | "EXPENSE" | "TRANSFER">(editTransaction?.type || "EXPENSE");
  const [isRecurring, setIsRecurring] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [formData, setFormData] = useState({
    description: editTransaction?.description || "",
    amount: editTransaction?.amount || "",
    date: editTransaction ? new Date(editTransaction.date).toISOString().split('T')[0] : (defaultDate || new Date().toISOString().split('T')[0]),
    accountId: editTransaction?.accountId || "",
    toAccountId: editTransaction?.toAccountId || "",
    categoryId: editTransaction?.categoryId || "",
    frequency: "monthly",
    interval: "1"
  });

  const isEditMode = !!editTransaction;

  const { toast } = useToast();

  // Reset form when edit transaction changes
  useEffect(() => {
    if (editTransaction) {
      setTransactionType(editTransaction.type);
      setIsRecurring(!!editTransaction.recurringId);
      setFormData({
        description: editTransaction.description || "",
        amount: editTransaction.amount || "",
        date: new Date(editTransaction.date).toISOString().split('T')[0],
        accountId: editTransaction.accountId || "",
        toAccountId: editTransaction.toAccountId || "",
        categoryId: editTransaction.categoryId || "",
        frequency: "monthly",
        interval: "1"
      });
    } else if (!isEditMode) {
      // Reset form for new transactions
      setTransactionType("EXPENSE");
      setIsRecurring(false);
      setFormData({
        description: "",
        amount: "",
        date: defaultDate || new Date().toISOString().split('T')[0],
        accountId: "",
        toAccountId: "",
        categoryId: "",
        frequency: "monthly",
        interval: "1"
      });
    }
  }, [editTransaction, defaultDate, isEditMode]);

  // Fetch accounts
  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  // Fetch categories for the selected type
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories", transactionType],
    queryFn: () => {
      const params = new URLSearchParams({ kind: transactionType });
      return fetch(`/api/categories?${params.toString()}`, {
        credentials: "include",
      }).then(res => res.json());
    },
    enabled: transactionType !== "TRANSFER",
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (transactionData: any) => {
      const url = isEditMode ? `/api/transactions/${editTransaction.id}` : "/api/transactions";
      const method = isEditMode ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(transactionData),
      });
      
      if (!response.ok) {
        let errorMessage = `Failed to ${isEditMode ? 'update' : 'create'} transaction`;
        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/daily-balances"] });
      toast({
        title: isEditMode 
          ? "Transaction updated" 
          : (isRecurring ? "Recurring transaction created" : "Transaction created"),
        description: isEditMode
          ? "Your transaction has been updated successfully."
          : (isRecurring 
            ? "Your recurring transaction and future occurrences have been added successfully." 
            : "Your transaction has been added successfully."),
      });
      onClose();
      // Reset form
      setFormData({
        description: "",
        amount: "",
        date: defaultDate || new Date().toISOString().split('T')[0],
        accountId: "",
        toAccountId: "",
        categoryId: "",
        frequency: "monthly",
        interval: "1"
      });
    },
    onError: (error: any) => {
      toast({
        title: `Error ${isEditMode ? 'updating' : 'creating'} transaction`,
        description: error.message || `Failed to ${isEditMode ? 'update' : 'create'} transaction`,
        variant: "destructive",
      });
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: async (deleteAll: boolean = false) => {
      const url = deleteAll 
        ? `/api/transactions/${editTransaction.id}?deleteAll=true`
        : `/api/transactions/${editTransaction.id}`;
      
      const response = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (!response.ok) {
        let errorMessage = "Failed to delete transaction";
        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
        } catch {
          // Response is not JSON (likely HTML error page)
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      // Handle successful response - may be empty
      try {
        return await response.json();
      } catch {
        // Empty response is okay for delete
        return { success: true };
      }
    },
    onSuccess: (_, deleteAll) => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/daily-balances"] });
      toast({
        title: "Transaction deleted",
        description: deleteAll 
          ? "This transaction and all future occurrences have been deleted successfully."
          : "Your transaction has been deleted successfully.",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting transaction",
        description: error.message || "Failed to delete transaction",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Description is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast({
        title: "Validation Error", 
        description: "Amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.accountId) {
      toast({
        title: "Validation Error",
        description: "Please select an account",
        variant: "destructive",
      });
      return;
    }
    
    if (transactionType === "TRANSFER" && !formData.toAccountId) {
      toast({
        title: "Validation Error",
        description: "Please select a destination account for transfers",
        variant: "destructive",
      });
      return;
    }
    
    // Category is optional - no validation needed
    
    // For recurring transactions in edit mode, show dialog
    if (isEditMode && editTransaction?.recurringId) {
      setShowUpdateDialog(true);
      return;
    }
    
    submitTransaction();
  };

  const submitTransaction = () => {
    const transactionData = {
      type: transactionType,
      amount: formData.amount,
      description: formData.description.trim(),
      date: formData.date,
      accountId: formData.accountId,
      toAccountId: transactionType === "TRANSFER" ? formData.toAccountId : undefined,
      categoryId: transactionType !== "TRANSFER" ? (formData.categoryId || null) : undefined,
      // Only include recurring fields when creating new transactions
      ...(isEditMode ? {} : {
        isRecurring,
        frequency: formData.frequency,
        interval: formData.interval,
      }),
    };

    console.log("Submitting transaction data:", transactionData);
    createTransactionMutation.mutate(transactionData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter description"
              required
            />
          </div>
          
          {/* Amount and Date on same line */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">$</span>
                </div>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  className="pl-8"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                required
              />
            </div>
          </div>
          
          {/* Transaction Type Toggle - moved below amount */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Transaction Type</Label>
            <Tabs value={transactionType} onValueChange={(value) => setTransactionType(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="INCOME" className="text-sm data-[state=active]:bg-green-500/20 data-[state=active]:text-green-800">Income</TabsTrigger>
                <TabsTrigger value="EXPENSE" className="text-sm data-[state=active]:bg-red-500/20 data-[state=active]:text-red-800">Expense</TabsTrigger>
                <TabsTrigger value="TRANSFER" className="text-sm data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-800">Transfer</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Recurring Option - only show for new transactions */}
          {!isEditMode && (
            <>
              <div className="flex items-center justify-between">
                <Label htmlFor="recurring" className="text-sm font-medium text-gray-700">
                  Recurring?
                </Label>
                <Switch
                  id="recurring"
                  checked={isRecurring}
                  onCheckedChange={setIsRecurring}
                />
              </div>
              
              {/* Recurring Options - moved directly under recurring toggle */}
              {isRecurring && (
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select value={formData.frequency} onValueChange={(value) => handleInputChange("frequency", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {formData.frequency === "custom" && (
                    <div>
                      <Label htmlFor="interval">Interval (days)</Label>
                      <Input
                        id="interval"
                        type="number"
                        min="1"
                        value={formData.interval}
                        onChange={(e) => handleInputChange("interval", e.target.value)}
                        placeholder="Enter number of days"
                      />
                    </div>
                  )}
                </div>
              )}
            </>
          )}
          
          {/* Account Selection */}
          <div>
            <Label htmlFor="account">
              {transactionType === "TRANSFER" ? "From Account" : "Account"}
            </Label>
            <Select value={formData.accountId} onValueChange={(value) => handleInputChange("accountId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select account..." />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(accounts) ? accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                )) : null}
              </SelectContent>
            </Select>
          </div>

          {/* To Account (for transfers) */}
          {transactionType === "TRANSFER" && (
            <div>
              <Label htmlFor="toAccount">To Account</Label>
              <Select value={formData.toAccountId} onValueChange={(value) => handleInputChange("toAccountId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination account..." />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(accounts) ? accounts.filter(account => account.id !== formData.accountId).map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  )) : null}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Category (not for transfers) */}
          {transactionType !== "TRANSFER" && (
            <div>
              <Label htmlFor="category">Category (Optional)</Label>
              <Select value={formData.categoryId} onValueChange={(value) => handleInputChange("categoryId", value === "none" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Uncategorized)</SelectItem>
                  {Array.isArray(categories) ? categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  )) : null}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            
            {isEditMode && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    type="button" 
                    variant="destructive"
                    disabled={deleteTransactionMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                    <AlertDialogDescription>
                      {editTransaction?.recurringId ? (
                        "This is a recurring transaction. You can delete only this specific transaction or delete this and all future occurrences."
                      ) : (
                        "Are you sure you want to delete this transaction? This action cannot be undone."
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    {editTransaction?.recurringId ? (
                      <>
                        <AlertDialogAction 
                          onClick={() => deleteTransactionMutation.mutate(false)}
                          disabled={deleteTransactionMutation.isPending}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          {deleteTransactionMutation.isPending ? "Deleting..." : "Delete Single Instance"}
                        </AlertDialogAction>
                        <AlertDialogAction 
                          onClick={() => deleteTransactionMutation.mutate(true)}
                          disabled={deleteTransactionMutation.isPending}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {deleteTransactionMutation.isPending ? "Deleting..." : "Delete All Future"}
                        </AlertDialogAction>
                      </>
                    ) : (
                      <AlertDialogAction 
                        onClick={() => deleteTransactionMutation.mutate(false)}
                        disabled={deleteTransactionMutation.isPending}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {deleteTransactionMutation.isPending ? "Deleting..." : "Delete Transaction"}
                      </AlertDialogAction>
                    )}
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {/* Update recurring transaction dialog */}
            <AlertDialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Update Recurring Transaction</AlertDialogTitle>
                  <AlertDialogDescription>
                    This is a recurring transaction. You can update only this specific transaction or all future occurrences. Currently, only single instance updates are supported.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => {
                      setShowUpdateDialog(false);
                      submitTransaction();
                    }}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Update Single Instance
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <Button type="submit" className="flex-1" disabled={createTransactionMutation.isPending}>
              {createTransactionMutation.isPending ? "Saving..." : (isEditMode ? "Update Transaction" : "Save Transaction")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
