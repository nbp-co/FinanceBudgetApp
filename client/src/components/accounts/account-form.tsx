import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { Account, InsertAccount } from "@shared/schema";

const accountFormSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  type: z.enum(["ASSET", "DEBT"]),
  subtype: z.enum([
    "checking", "savings", "money_market", "investment", "other_asset",
    "credit_card", "mortgage", "student_loan", "auto_loan", "line_of_credit", "other_debt"
  ]),
  openingBalance: z.string().min(1, "Balance is required"),
  currency: z.string().default("USD"),
  aprApy: z.string().optional(),
  creditLimit: z.string().optional(),
});

type AccountFormData = z.infer<typeof accountFormSchema>;

interface AccountFormProps {
  isOpen: boolean;
  onClose: () => void;
  type: "ASSET" | "DEBT";
  account?: Account;
}

export function AccountForm({ isOpen, onClose, type, account }: AccountFormProps) {
  const queryClient = useQueryClient();
  
  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: account?.name || "",
      type: type,
      subtype: account?.subtype || (type === "ASSET" ? "checking" : "credit_card"),
      openingBalance: account?.openingBalance || "0",
      currency: account?.currency || "USD",
      aprApy: account?.aprApy || "",
      creditLimit: account?.creditLimit || "",
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: AccountFormData) => {
      const payload = {
        name: data.name,
        type: data.type,
        subtype: data.subtype,
        openingBalance: data.openingBalance,
        currency: data.currency,
        aprApy: data.aprApy || undefined,
        creditLimit: data.creditLimit || undefined,
      };

      if (account) {
        const response = await fetch(`/api/accounts/${account.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        return response.json();
      } else {
        const response = await fetch("/api/accounts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      onClose();
      form.reset();
    }
  });

  const onSubmit = (data: AccountFormData) => {
    mutation.mutate(data);
  };

  const assetSubtypes = [
    { value: "checking", label: "Checking" },
    { value: "savings", label: "Savings" },
    { value: "money_market", label: "Money Market" },
    { value: "investment", label: "Investment" },
    { value: "other_asset", label: "Other Asset" },
  ];

  const debtSubtypes = [
    { value: "credit_card", label: "Credit Card" },
    { value: "mortgage", label: "Mortgage" },
    { value: "student_loan", label: "Student Loan" },
    { value: "auto_loan", label: "Auto Loan" },
    { value: "line_of_credit", label: "Line of Credit" },
    { value: "other_debt", label: "Other Debt" },
  ];

  const subtypes = type === "ASSET" ? assetSubtypes : debtSubtypes;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {account ? "Edit Account" : `Add ${type === "ASSET" ? "Asset" : "Debt"} Account`}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter account name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="subtype"
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
                      {subtypes.map((subtype) => (
                        <SelectItem key={subtype.value} value={subtype.value}>
                          {subtype.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="openingBalance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opening Balance</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="aprApy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>APR/APY (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {type === "DEBT" && (
              <FormField
                control={form.control}
                name="creditLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credit Limit</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : account ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}