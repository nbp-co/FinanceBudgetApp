import { ReactNode } from "react";
import { DesktopSidebar } from "./desktop-sidebar";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { MobileHeader } from "./mobile-header";

interface AppShellProps {
  children: ReactNode;
  accountsTabValue?: string;
  onAccountsTabChange?: (value: string) => void;
}

export function AppShell({ children, accountsTabValue, onAccountsTabChange }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DesktopSidebar />
      
      <div className="lg:pl-52">
        <MobileHeader 
          accountsTabValue={accountsTabValue}
          onAccountsTabChange={onAccountsTabChange}
        />
        
        <main className="pb-20 lg:pb-8">
          {children}
        </main>
      </div>
      
      <MobileBottomNav />
    </div>
  );
}
