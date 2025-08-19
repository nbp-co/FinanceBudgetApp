import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Edit, Trash2, Calendar, DollarSign, Tag, Building } from "lucide-react";
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Transaction Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
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

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <div className="flex gap-2">
              {onEdit && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onEdit(transaction)}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              )}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}