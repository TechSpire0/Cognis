import { useState } from "react";
import { AuthPages } from "./components/AuthPages";
import { TopNav } from "./components/TopNav";
import { Dashboard } from "./components/Dashboard";
import { UploadPage } from "./components/UploadPage";
import { ChatAI } from "./components/ChatAI";
import { ReportsPage } from "./components/ReportsPage";
import { AdminDashboard } from "./components/AdminDashboard";
import { CaseManagement } from "./components/CaseManagement";
import { UserManagement } from "./components/UserManagement";
import { AuditLogs } from "./components/AuditLogs";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  const [currentPage, setCurrentPage] = useState("login");
  const [userRole, setUserRole] = useState("investigator"); // 'admin' or 'investigator'

  const handleNavigate = (page) => {
    setCurrentPage(page);

    // Handle role switching based on login (mock implementation)
    if (page === "admin-dashboard") {
      setUserRole("admin");
    } else if (page === "dashboard") {
      setUserRole("investigator");
    }
  };

  // Auth pages (full screen)
  if (
    currentPage === "login" ||
    currentPage === "signup" ||
    currentPage === "forgot-password"
  ) {
    return (
      <AuthPages
        page={currentPage} // JSX doesn't need type casting
        onNavigate={handleNavigate}
      />
    );
  }

  // Main application layout (top nav + content)
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0D1117]">
      <TopNav
        currentPage={currentPage}
        onNavigate={handleNavigate}
        userRole={userRole}
      />

      <div className="flex-1 overflow-hidden">
        {/* Investigator Pages */}
        {currentPage === "dashboard" && (
          <Dashboard onNavigate={handleNavigate} />
        )}
        {currentPage === "upload" && <UploadPage />}
        {currentPage === "chat" && <ChatAI />}
        {currentPage === "reports" && <ReportsPage />}

        {/* Admin Pages */}
        {currentPage === "admin-dashboard" && (
          <AdminDashboard onNavigate={handleNavigate} />
        )}
        {currentPage === "case-management" && <CaseManagement />}
        {currentPage === "user-management" && <UserManagement />}
        {currentPage === "audit-logs" && <AuditLogs />}
      </div>

      <Toaster />
    </div>
  );
}
