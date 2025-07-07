
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserAvatar } from "@/components/UserAvatar";
import type { User } from "@supabase/supabase-js";

interface DashboardHeaderProps {
  user: User;
  onLogout: () => void;
}

export const DashboardHeader = ({ user, onLogout }: DashboardHeaderProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="bg-card shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">💰</span>
            <h1 className={`font-bold text-foreground ${isMobile ? 'text-xl' : 'text-2xl'}`}>
              CashiFracker
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <UserAvatar user={user} />
            <Button
              onClick={onLogout}
              variant="outline"
              size={isMobile ? "sm" : "default"}
              className="flex items-center space-x-1"
            >
              <LogOut className="h-4 w-4" />
              {!isMobile && <span>Logout</span>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
