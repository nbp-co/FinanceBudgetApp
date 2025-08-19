import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { LogOut } from "lucide-react";

export default function SettingsPage() {
  const { logoutMutation } = useAuth();

  return (
    <AppShell>
      <div className="p-4 lg:p-8 flex flex-col min-h-[calc(100vh-200px)]">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your account preferences and settings</p>
        </div>

        {/* Spacer to push logout button to bottom */}
        <div className="flex-1"></div>

        {/* Logout button at bottom */}
        <div className="max-w-sm mx-auto w-full">
          <Button 
            variant="outline" 
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="w-full py-3"
            size="lg"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {logoutMutation.isPending ? "Signing out..." : "Logout"}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
