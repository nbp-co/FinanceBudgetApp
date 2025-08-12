import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddTransactionModal({ isOpen, onClose }: AddTransactionModalProps) {
  const [transactionType, setTransactionType] = useState<"INCOME" | "EXPENSE" | "TRANSFER">("EXPENSE");
  const [isRecurring, setIsRecurring] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    accountId: "",
    toAccountId: "",
    categoryId: "",
    frequency: "monthly",
    interval: "1"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement transaction creation
    console.log("Creating transaction:", { ...formData, type: transactionType, isRecurring });
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
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
                <TabsTrigger value="INCOME" className="text-sm">Income</TabsTrigger>
                <TabsTrigger value="EXPENSE" className="text-sm">Expense</TabsTrigger>
                <TabsTrigger value="TRANSFER" className="text-sm">Transfer</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Recurring Option - moved below date with new label */}
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
                <SelectItem value="checking">Checking Account</SelectItem>
                <SelectItem value="savings">Savings Account</SelectItem>
                <SelectItem value="credit">Credit Card</SelectItem>
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
                  <SelectItem value="checking">Checking Account</SelectItem>
                  <SelectItem value="savings">Savings Account</SelectItem>
                  <SelectItem value="credit">Credit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Category (not for transfers) */}
          {transactionType !== "TRANSFER" && (
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.categoryId} onValueChange={(value) => handleInputChange("categoryId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent>
                  {transactionType === "INCOME" ? (
                    <>
                      <SelectItem value="salary">Salary</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                      <SelectItem value="investment">Investment Income</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="groceries">Groceries</SelectItem>
                      <SelectItem value="transportation">Transportation</SelectItem>
                      <SelectItem value="entertainment">Entertainment</SelectItem>
                      <SelectItem value="housing">Housing</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
          

          
          {/* Recurring Options */}
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
          
          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Save Transaction
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
