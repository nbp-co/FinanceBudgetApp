import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Save } from "lucide-react";

export default function StatementsPage() {
  return (
    <AppShell>
      <div className="p-4 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Monthly Statements</h1>
            <p className="text-gray-600">Review and update monthly account statements</p>
          </div>
          <div className="flex items-center space-x-3">
            <Select defaultValue="2024-11">
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024-11">November 2024</SelectItem>
                <SelectItem value="2024-10">October 2024</SelectItem>
                <SelectItem value="2024-09">September 2024</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save All
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>November 2024 Statements</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statement Balance</TableHead>
                  <TableHead>Interest Charged</TableHead>
                  <TableHead>Rewards Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Checking Account</TableCell>
                  <TableCell>Asset</TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      defaultValue="12345.67" 
                      className="w-32"
                      step="0.01"
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      defaultValue="0.00" 
                      className="w-28"
                      step="0.01"
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      defaultValue="0" 
                      className="w-24"
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Savings Account</TableCell>
                  <TableCell>Asset</TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      defaultValue="25890.12" 
                      className="w-32"
                      step="0.01"
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      defaultValue="95.43" 
                      className="w-28"
                      step="0.01"
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      defaultValue="0" 
                      className="w-24"
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Credit Card</TableCell>
                  <TableCell>Debt</TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      defaultValue="2456.78" 
                      className="w-32"
                      step="0.01"
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      defaultValue="47.23" 
                      className="w-28"
                      step="0.01"
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      defaultValue="125" 
                      className="w-24"
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Total Assets</p>
                <p className="text-2xl font-bold text-green-600">$38,235.79</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Total Debts</p>
                <p className="text-2xl font-bold text-red-600">$2,456.78</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Net Worth</p>
                <p className="text-2xl font-bold text-primary">$35,779.01</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
