import {
  Home,
  FolderOpen,
  Upload,
  Search,
  FileDown,
  LogOut,
  Users,
  Activity,
  MessageSquare,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { motion } from "motion/react";
import cognisLogo from "../assets/Cognis.jpg";

export function AppSidebar({ currentPage, onNavigate, userRole }) {
  // Investigator menu items - cannot assign cases, only work on assigned ones
  const investigatorItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "upload", label: "Upload", icon: Upload },
    { id: "search", label: "Search", icon: Search },
    { id: "chat", label: "AI Chat", icon: MessageSquare },
    { id: "reports", label: "Reports", icon: FileDown },
  ];

  // Admin menu items - full access including case assignment
  const adminItems = [
    { id: "admin-dashboard", label: "Admin Dashboard", icon: Home },
    { id: "case-management", label: "Case Management", icon: FolderOpen },
    { id: "user-management", label: "User Management", icon: Users },
    { id: "audit-logs", label: "Audit Logs", icon: Activity },
  ];

  const menuItems = userRole === "admin" ? adminItems : investigatorItems;

  return (
    <div
      className={`w-64 h-screen ${
        userRole === "admin" ? "bg-[#0F172A]" : "bg-[#19183B]"
      } border-r ${
        userRole === "admin" ? "border-[#334155]" : "border-[#708993]"
      } flex flex-col`}
    >
      {/* Logo */}
      <div
        className={`p-6 border-b ${
          userRole === "admin" ? "border-[#334155]" : "border-[#708993]"
        }`}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0"
            style={{
              boxShadow:
                userRole === "admin"
                  ? "0 0 6px rgba(34, 211, 238, 0.15)"
                  : "0 0 6px rgba(112, 137, 147, 0.3)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            <img
              src={cognisLogo}
              alt="COGNIS Logo"
              className="w-full h-full object-cover"
            />
          </motion.div>
          <div>
            <h2
              className={`${
                userRole === "admin" ? "text-[#F1F5F9]" : "text-[#E7F2EF]"
              } text-xl tracking-tight`}
            >
              COGNIS
            </h2>
            <p
              className={`${
                userRole === "admin" ? "text-[#94A3B8]" : "text-[#A1C2BD]"
              } text-xs`}
            >
              UFDR Analysis
            </p>
          </div>
        </div>
        <div
          className={`mt-4 px-3 py-1.5 ${
            userRole === "admin"
              ? "bg-[#1E293B] border-[#334155]"
              : "bg-[#708993]/20 border-[#708993]"
          } rounded-lg border`}
        >
          <p
            className={`${
              userRole === "admin" ? "text-[#3B82F6]" : "text-[#E7F2EF]"
            } capitalize text-sm`}
          >
            {userRole}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <Button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              variant="ghost"
              className={`w-full justify-start gap-3 relative transition-all ${
                isActive
                  ? userRole === "admin"
                    ? "bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/30 glow-hover"
                    : "bg-[#708993]/20 text-[#E7F2EF] border border-[#708993]"
                  : userRole === "admin"
                  ? "text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F1F5F9]"
                  : "text-[#A1C2BD] hover:bg-[#708993]/10 hover:text-[#E7F2EF]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <Badge className="bg-[#EF4444] text-white hover:bg-[#EF4444] text-xs px-2">
                  {item.badge}
                </Badge>
              )}
            </Button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div
        className={`p-4 border-t ${
          userRole === "admin" ? "border-[#334155]" : "border-[#708993]"
        }`}
      >
        <Button
          onClick={() => onNavigate("login")}
          variant="ghost"
          className={`w-full justify-start gap-3 ${
            userRole === "admin"
              ? "text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F1F5F9]"
              : "text-[#A1C2BD] hover:bg-[#708993]/10 hover:text-[#E7F2EF]"
          }`}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
