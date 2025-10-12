import {
  Home,
  Upload,
  Search,
  FileDown,
  LogOut,
  FolderOpen,
  Users,
  Activity,
  MessageSquare,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import cognisLogo from "../assets/Cognis.jpg";

export function TopNav({ currentPage, onNavigate, userRole }) {
  // Investigator menu items
  const investigatorItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "upload", label: "Upload", icon: Upload },
    { id: "search", label: "Search", icon: Search },
    { id: "chat", label: "AI Chat", icon: MessageSquare },
    { id: "reports", label: "Reports", icon: FileDown },
  ];

  // Admin menu items
  const adminItems = [
    { id: "admin-dashboard", label: "Dashboard", icon: Home },
    { id: "case-management", label: "Cases", icon: FolderOpen },
    { id: "user-management", label: "Users", icon: Users },
    { id: "audit-logs", label: "Audit Logs", icon: Activity },
  ];

  const menuItems = userRole === "admin" ? adminItems : investigatorItems;

  return (
    <nav className="w-full bg-[#161B22] border-b border-[#30363D] px-6 py-3 shadow-lg">
      <div className="flex items-center justify-between max-w-[2000px] mx-auto">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3 min-w-[200px]">
          <div
            className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-[#00BFA5]/30 hover:ring-[#00BFA5]/60 transition-all cursor-pointer"
            onClick={() =>
              onNavigate(userRole === "admin" ? "admin-dashboard" : "dashboard")
            }
          >
            <img
              src={cognisLogo}
              alt="COGNIS Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-[#E6EDF3] tracking-tight">COGNIS</h2>
            <p className="text-[#9BA1A6] text-xs">UFDR Analysis</p>
          </div>
        </div>

        {/* Centered Navigation Links */}
        <div className="hidden lg:flex items-center gap-2 flex-1 justify-center">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <Button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                variant="ghost"
                className={`gap-2 px-5 py-5 rounded-xl transition-all duration-300 relative group ${
                  isActive
                    ? "bg-[#00BFA5] text-[#0D1117] hover:bg-[#03DAC6] shadow-lg shadow-[#00BFA5]/20"
                    : "text-[#9BA1A6] hover:bg-[#21262D] hover:text-[#E6EDF3] hover:shadow-md"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon
                  className={`w-4 h-4 transition-transform duration-300 ${
                    isActive ? "" : "group-hover:scale-110"
                  }`}
                />
                <span className="font-medium">{item.label}</span>
                {!isActive && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#00BFA5] group-hover:w-3/4 transition-all duration-300" />
                )}
              </Button>
            );
          })}
        </div>

        {/* Right Side - Role Badge and Logout */}
        <div className="flex items-center gap-3 min-w-[200px] justify-end">
          <Badge
            className={`px-3 py-1.5 ${
              userRole === "admin"
                ? "bg-[#6C63FF]/20 text-[#6C63FF] border-[#6C63FF]"
                : "bg-[#00BFA5]/20 text-[#00BFA5] border-[#00BFA5]"
            }`}
          >
            {userRole === "admin" ? "Admin" : "Investigator"}
          </Badge>

          <Button
            onClick={() => onNavigate("login")}
            variant="ghost"
            size="sm"
            className="gap-2 text-[#9BA1A6] hover:bg-[#FF5252]/10 hover:text-[#FF5252] hover:border-[#FF5252] border border-transparent transition-all duration-300 px-4 py-5 rounded-xl"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline font-medium">Logout</span>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation - Centered */}
      <div className="lg:hidden mt-3 flex flex-wrap gap-2 justify-center">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <Button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              variant="ghost"
              size="sm"
              className={`gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                isActive
                  ? "bg-[#00BFA5] text-[#0D1117] hover:bg-[#03DAC6]"
                  : "text-[#9BA1A6] hover:bg-[#21262D] hover:text-[#E6EDF3]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
