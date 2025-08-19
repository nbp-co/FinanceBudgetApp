import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, User, Bell, Shield, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const { user, logoutMutation } = useAuth();
  const [openSections, setOpenSections] = useState({
    profile: false,
    security: false,
    notifications: false,
    account: false
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <AppShell>
      <div className="p-4 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your account preferences and settings</p>
        </div>

        <div className="grid gap-6 max-w-2xl">
          {/* Profile Settings */}
          <Card>
            <Collapsible open={openSections.profile} onOpenChange={() => toggleSection('profile')}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <User className="mr-2 h-5 w-5" />
                      Profile Information
                    </div>
                    {openSections.profile ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name" 
                      defaultValue={user?.name || ""} 
                      placeholder="Your full name" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      defaultValue={user?.email || ""} 
                      placeholder="your@email.com" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select defaultValue={user?.tz || "UTC"}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="zipcode">ZIP Code</Label>
                    <Input 
                      id="zipcode" 
                      type="text" 
                      maxLength={5}
                      pattern="[0-9]{5}"
                      placeholder="12345" 
                      title="Please enter a valid 5-digit ZIP code"
                      onInput={(e) => {
                        const target = e.target as HTMLInputElement;
                        target.value = target.value.replace(/\D/g, '');
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="birthyear">Year Born</Label>
                    <Input 
                      id="birthyear" 
                      type="text" 
                      maxLength={4}
                      pattern="[0-9]{4}"
                      placeholder="1990" 
                      title="Please enter exactly 4 digits (1900-2004)"
                      onInput={(e) => {
                        const target = e.target as HTMLInputElement;
                        // Only allow digits
                        target.value = target.value.replace(/\D/g, '');
                        
                        // Validate length and range
                        if (target.value.length === 4) {
                          const year = parseInt(target.value);
                          if (year < 1900 || year > 2004) {
                            target.setCustomValidity('Year must be between 1900 and 2004');
                          } else {
                            target.setCustomValidity('');
                          }
                        } else if (target.value.length > 0) {
                          target.setCustomValidity('Year must be exactly 4 digits');
                        } else {
                          target.setCustomValidity('');
                        }
                      }}
                    />
                  </div>
                  <Button>Update Profile</Button>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Security Settings */}
          <Card>
            <Collapsible open={openSections.security} onOpenChange={() => toggleSection('security')}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Shield className="mr-2 h-5 w-5" />
                      Security
                    </div>
                    {openSections.security ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input 
                      id="current-password" 
                      type="password" 
                      placeholder="Enter current password" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-password">New Password</Label>
                    <Input 
                      id="new-password" 
                      type="password" 
                      placeholder="Enter new password" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      placeholder="Confirm new password" 
                    />
                  </div>
                  <Button>Change Password</Button>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Notifications */}
          <Card>
            <Collapsible open={openSections.notifications} onOpenChange={() => toggleSection('notifications')}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Bell className="mr-2 h-5 w-5" />
                      Notifications
                    </div>
                    {openSections.notifications ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Notification preferences will be available in a future update.
                  </p>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Account Actions */}
          <Card>
            <Collapsible open={openSections.account} onOpenChange={() => toggleSection('account')}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      Account Actions
                    </div>
                    {openSections.account ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <Button 
                    variant="outline" 
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                    className="w-full"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
                  </Button>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
