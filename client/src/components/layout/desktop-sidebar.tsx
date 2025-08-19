import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { 
  Wallet, 
  Home, 
  Building, 
  Calendar,
  FileText, 
  Settings 
} from "lucide-react";

const navigation = [
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Accounts", href: "/accounts", icon: Building },
  { name: "Statements", href: "/statements", icon: FileText },
  { name: "Summary", href: "/summary", icon: Home },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function DesktopSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  return (
    <nav className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">BudgetApp</h1>
          </div>
        </div>
        
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.href;
                  
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-gray-700 hover:text-primary hover:bg-gray-50"
                        )}
                      >
                        <Icon 
                          className={cn(
                            "h-5 w-5 shrink-0 transition-colors",
                            isActive ? "text-primary" : "text-gray-400 group-hover:text-primary"
                          )} 
                        />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
            
            <li className="mt-auto">
              <div className="flex items-center gap-x-4 p-2">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </span>
                </div>
                <div className="text-sm leading-6">
                  <p className="font-semibold text-gray-900">{user?.name || "User"}</p>
                </div>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </nav>
  );
}
