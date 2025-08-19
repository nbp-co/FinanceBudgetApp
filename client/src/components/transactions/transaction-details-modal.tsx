import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Edit, Trash2, Calendar, DollarSign, Tag, Building, Save, X } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Transaction, Account, Category } from "@shared/schema";

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  account?: Account;
  category?: Category;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transactionId: string) => void;
}

export function TransactionDetailsModal({ 
  isOpen, 
  onClose, 
  transaction, 
  account, 
  category,
  onEdit,
  onDelete 
}: TransactionDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    description: "",
    amount: "",
    date: "",
    accountId: "",
    categoryId: "",
    type: "EXPENSE" as "INCOME" | "EXPENSE" | "TRANSFER"
  });

  const { toast } = useToast();

  // Fetch accounts for editing
  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
    enabled: isEditing,
  });

  // Fetch categories for editing based on transaction type
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories", editData.type],
    queryFn: () => {
      const params = new URLSearchParams({ kind: editData.type });
      return fetch(`/api/categories?${params.toString()}`, {
        credentials: "include",
      }).then(res => res.json());
    },
    enabled: isEditing && editData.type !== "TRANSFER",
  });

  // Update transaction mutation
  const updateTransactionMutation = useMutation({
    mutationFn: async (updateData: any) => {
      if (!transaction) throw new Error("No transaction to update");
      
      const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update transaction");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Transaction updated",
        description: "Your transaction has been updated successfully.",
      });
      setIsEditing(false);
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error updating transaction",
        description: error.message || "Failed to update transaction",
        variant: "destructive",
      });
    },
  });

  // Initialize edit data when transaction changes or editing starts
  useEffect(() => {
    if (transaction && isEditing) {
      setEditData({
        description: transaction.description || "",
        amount: transaction.amount,
        date: format(new Date(transaction.date), "yyyy-MM-dd"),
        accountId: transaction.accountId,
        categoryId: transaction.categoryId || "",
        type: transaction.type
      });
    }
  }, [transaction, isEditing]);

  if (!transaction) return null;

  const getTypeColor = (type: string) => {
    switch (type) {
      case "INCOME":
        return "bg-green-100 text-green-800";
      case "EXPENSE":
        return "bg-red-100 text-red-800";
      case "TRANSFER":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case "INCOME":
        return "text-green-600";
      case "EXPENSE":
        return "text-red-600";
      case "TRANSFER":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const handleSave = () => {
    // Validation
    if (!editData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Description is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!editData.amount || parseFloat(editData.amount) <= 0) {
      toast({
        title: "Validation Error", 
        description: "Amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }
    
    if (!editData.accountId) {
      toast({
        title: "Validation Error",
        description: "Please select an account",
        variant: "destructive",
      });
      return;
    }
    
    if (editData.type !== "TRANSFER" && !editData.categoryId) {
      toast({
        title: "Validation Error",
        description: "Please select a category",
        variant: "destructive",
      });
      return;
    }

    const updateData = {
      type: editData.type,
      amount: editData.amount,
      description: editData.description.trim(),
      date: editData.date,
      accountId: editData.accountId,
      categoryId: editData.type !== "TRANSFER" ? editData.categoryId : undefined,
    };

    updateTransactionMutation.mutate(updateData);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {isEditing ? "Edit Transaction" : "Transaction Details"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {isEditing ? (
            /* Edit Form */
            <div className="space-y-4">
              {/* Description */}
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={editData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Enter description"
                />
              </div>

              {/* Amount and Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-amount">Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">$</span>
                    <Input
                      id="edit-amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={editData.amount}
                      onChange={(e) => handleInputChange("amount", e.target.value)}
                      className="pl-8"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-date">Date</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                  />
                </div>
              </div>

              {/* Transaction Type */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Transaction Type</Label>
                <Tabs value={editData.type} onValueChange={(value) => handleInputChange("type", value)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="INCOME" className="text-sm data-[state=active]:bg-green-500/20 data-[state=active]:text-green-800">Income</TabsTrigger>
                    <TabsTrigger value="EXPENSE" className="text-sm data-[state=active]:bg-red-500/20 data-[state=active]:text-red-800">Expense</TabsTrigger>
                    <TabsTrigger value="TRANSFER" className="text-sm data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-800">Transfer</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Account */}
              <div>
                <Label htmlFor="edit-account">Account</Label>
                <Select value={editData.accountId} onValueChange={(value) => handleInputChange("accountId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account..." />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category (not for transfers) */}
              {editData.type !== "TRANSFER" && (
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <Select value={editData.categoryId} onValueChange={(value) => handleInputChange("categoryId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Action Buttons - Edit Mode */}
              <div className="flex justify-between pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSave}
                    disabled={updateTransactionMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {updateTransactionMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* View Mode */
            <>
              {/* Transaction Type and Amount */}
              <div className="flex items-center justify-between">
                <Badge className={getTypeColor(transaction.type)}>
                  {transaction.type}
                </Badge>
                <div className={`text-2xl font-bold ${getAmountColor(transaction.type)}`}>
                  {transaction.type === "EXPENSE" ? "-" : "+"}
                  {formatCurrency(parseFloat(transaction.amount))}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Description</h3>
                <p className="text-lg">{transaction.description || "No description"}</p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 gap-4">
                {/* Date */}
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <span className="text-sm text-gray-500">Date</span>
                    <p className="font-medium">
                      {format(new Date(transaction.date), "EEEE, MMMM d, yyyy")}
                    </p>
                  </div>
                </div>

                {/* Account */}
                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-gray-400" />
                  <div>
                    <span className="text-sm text-gray-500">Account</span>
                    <p className="font-medium">{account?.name || "Unknown Account"}</p>
                  </div>
                </div>

                {/* Category */}
                {category && transaction.type !== "TRANSFER" && (
                  <div className="flex items-center gap-3">
                    <Tag className="h-4 w-4 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-500">Category</span>
                      <p className="font-medium">{category.name}</p>
                    </div>
                  </div>
                )}

                {/* Currency */}
                <div className="flex items-center gap-3">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <div>
                    <span className="text-sm text-gray-500">Currency</span>
                    <p className="font-medium">{transaction.currency}</p>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 flex items-center justify-center">
                    <div className={`h-2 w-2 rounded-full ${transaction.cleared ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Status</span>
                    <p className="font-medium">{transaction.cleared ? "Cleared" : "Pending"}</p>
                  </div>
                </div>
              </div>

              {/* Created Date */}
              <div className="text-xs text-gray-500 border-t pt-3">
                Created {format(new Date(transaction.createdAt), "MMM d, yyyy 'at' h:mm a")}
              </div>

              {/* Action Buttons - View Mode */}
              <div className="flex justify-between pt-4 border-t">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  {onDelete && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onDelete(transaction.id)}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  )}
                </div>
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}