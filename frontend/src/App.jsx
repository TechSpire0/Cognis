import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LandingUpload } from './components/LandingUpload';
import { SearchResults } from './components/SearchResults';
import { NetworkDashboard } from './components/NetworkDashboard';
import { ReportGeneration } from './components/ReportGeneration';
import { AuditLog } from './components/AuditLog';
import { AdminPanel } from './components/AdminPanel';
import { ChatAssistant } from './components/ChatAssistant';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import api from "./services/api";

export default function App() {
  const [currentView, setCurrentView] = useState('upload');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState('signup'); // 'signup' or 'login'
  const [currentUser, setCurrentUser] = useState({
    name: 'Detective Sarah Chen',
    id: 'IO_001',
    role: 'Investigator'
  });
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, action: 'Login', user: 'Detective Sarah Chen', timestamp: '2024-01-15 09:15:23', details: 'User logged into system' },
    { id: 2, action: 'File Uploaded', user: 'Detective Sarah Chen', timestamp: '2024-01-15 09:22:45', details: 'case_001_whatsapp.zip uploaded successfully' },
    { id: 3, action: 'Search Performed', user: 'Detective Sarah Chen', timestamp: '2024-01-15 09:25:12', details: 'Search query: "crypto addresses bitcoin"' }
  ]);
  const [caseData, setCaseData] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);

  const addAuditLog = (action, details) => {
    const newLog = {
      id: auditLogs.length + 1,
      action,
      user: currentUser.name,
      timestamp: new Date().toLocaleString(),
      details
    };
    setAuditLogs([newLog, ...auditLogs]);
  };
  
const handleLogin = () => {
  setIsAuthenticated(true);
  addAuditLog("Login", "User successfully logged in");

  // Fetch current user from backend
  api.get("/auth/users/me")
    .then((res) => {
      setCurrentUser({
        name: res.data.username,
        id: res.data.id,
        role: res.data.role,
      });
      setCurrentView(res.data.role === "admin" ? "admin-cases" : "upload");
    })
    .catch(() => {
      // fallback if request fails
      setCurrentUser({ name: "Unknown", id: "NA", role: "investigator" });
    });
};

const handleSignup = (userData) => {
  setCurrentUser({
    name: userData.username,
    id: userData.id,
    role: userData.role,
  });
  setCurrentView(userData.role === "admin" ? "admin-cases" : "upload");
  setIsAuthenticated(true);
  addAuditLog("Account Created", `New ${userData.role} account created for ${userData.username}`);
};
  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthView('signup');
    setCurrentView('upload');
    addAuditLog('Logout', 'User logged out of system');
  };

  const handleSignupToLogin = () => {
    setAuthView('login');
  };

  
  const handleAdminPanelAccess = () => {
    if (currentUser.role === 'Admin') {
      setCurrentView('admin-cases');
      addAuditLog('Admin Panel Access', 'Administrator accessed admin panel');
    }
  };



  const renderCurrentView = () => {
    switch (currentView) {
      case 'upload':
        return <LandingUpload onUpload={setCaseData} addAuditLog={addAuditLog} />;
      case 'search':
        return <SearchResults caseData={caseData} addAuditLog={addAuditLog} />;
      case 'dashboard':
        return <NetworkDashboard caseData={caseData} addAuditLog={addAuditLog} />;
      case 'report':
        return <ReportGeneration caseData={caseData} addAuditLog={addAuditLog} />;
      case 'audit':
        return <AuditLog logs={auditLogs} />;
      case 'admin':
        return <AdminPanel logs={auditLogs} addAuditLog={addAuditLog} />;
      case 'admin-cases':
        return <AdminPanel logs={auditLogs} addAuditLog={addAuditLog} activeTab="cases" />;
      case 'admin-audit':
        return <AdminPanel logs={auditLogs} addAuditLog={addAuditLog} activeTab="audit" />;
      default:
        return <LandingUpload onUpload={setCaseData} addAuditLog={addAuditLog} />;
    }
  };

  // Show authentication screens if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="h-screen bg-background text-foreground dark">
        {authView === 'signup' ? (
          <Signup onNavigateToLogin={handleSignupToLogin} onSignup={handleSignup} />
        ) : (
          <Login onLogin={handleLogin} onNavigateToSignup={() => setAuthView('signup')} />
        )}
      </div>
    );
  }

  return (
    <div className="h-screen bg-background text-foreground dark">
      <div className="flex h-full">
        <Sidebar 
          currentView={currentView} 
          onViewChange={setCurrentView} 
          userRole={currentUser.role}
        />
        <div className="flex-1 flex flex-col">
          <Header 
            user={currentUser} 
            onLogout={handleLogout} 
            onAdminClick={handleAdminPanelAccess}
          />
          <main className="flex-1 overflow-hidden relative">
            {renderCurrentView()}
            {chatOpen && (
              <ChatAssistant 
                onClose={() => setChatOpen(false)} 
                addAuditLog={addAuditLog}
                caseData={caseData}
              />
            )}
          </main>
        </div>
      </div>
      
      {/* Floating Chat Button */}
      {currentView !== 'upload' && !chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-colors z-50"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}
    </div>
  );
}