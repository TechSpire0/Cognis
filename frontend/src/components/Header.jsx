import React from 'react';
import { Badge } from './ui/badge';

export function Header({ user, onLogout, onAdminClick }) {
  return (
    <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-2xl text-blue-400">AI Forensic Assistant</h1>
        <p className="text-sm text-muted-foreground">Digital Investigation Platform</p>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm">{user.name}</p>
          <p className="text-xs text-muted-foreground">ID: {user.id}</p>
        </div>
        {user.role === 'Admin' ? (
          <button
            onClick={onAdminClick}
            className="transition-all hover:scale-105"
            title="Access Admin Panel"
          >
            <Badge 
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 cursor-pointer"
            >
              {user.role}
            </Badge>
          </button>
        ) : (
          <Badge 
            variant="secondary"
            className="bg-blue-600"
          >
            {user.role}
          </Badge>
        )}
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Online</span>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            className="ml-4 px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
            title="Logout"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        )}
      </div>
    </header>
  );
}