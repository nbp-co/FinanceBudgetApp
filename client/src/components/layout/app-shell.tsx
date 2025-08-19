import { ReactNode } from "react";
import { DesktopSidebar } from "./desktop-sidebar";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { MobileHeader } from "./mobile-header";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DesktopSidebar />
      
      <div className="lg:pl-52">
        <MobileHeader />
        
        <main className="pb-20 lg:pb-8">
          {children}
        </main>
      </div>
      
      <MobileBottomNav />
    </div>
  );
}
