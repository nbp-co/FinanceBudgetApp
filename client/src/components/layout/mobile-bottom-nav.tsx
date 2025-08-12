import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Building, 
  Calendar,
  DollarSign,
  FileText,
  Settings 
} from "lucide-react";

const navigation = [
  { name: "Calendar", href: "/", icon: Home },
  { name: "Summary", href: "/summary", icon: Calendar },
  { name: "Accounts", href: "/accounts", icon: Building },
  { name: "Budget", href: "/budget", icon: DollarSign },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function MobileBottomNav() {
  const [location] = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-50">
      <div className="grid grid-cols-4 h-16">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 transition-colors",
                isActive ? "text-primary" : "text-gray-400"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
