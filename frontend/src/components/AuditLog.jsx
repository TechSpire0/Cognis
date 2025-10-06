import React, { useState } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';

export function AuditLog({ logs }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filteredLogs, setFilteredLogs] = useState(logs);

  const handleSearch = () => {
    let filtered = logs;
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(log => 
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (filterAction !== 'all') {
      filtered = filtered.filter(log => log.action === filterAction);
    }
    
    setFilteredLogs(filtered);
  };

  React.useEffect(() => {
    handleSearch();
  }, [searchQuery, filterAction, logs]);

  const getActionIcon = (action) => {
    switch (action) {
      case 'Login':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
        );
      case 'File Uploaded':
        return (
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        );
      case 'Search Performed':
        return (
          <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        );
      case 'AI Query Sent':
        return (
          <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case 'Report Exported':
        return (
          <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'Node Selected':
        return (
          <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        );
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'Login': return 'bg-green-600';
      case 'File Uploaded': return 'bg-blue-600';
      case 'Search Performed': return 'bg-purple-600';
      case 'AI Query Sent': return 'bg-yellow-600';
      case 'AI Response Generated': return 'bg-yellow-500';
      case 'Report Exported': return 'bg-orange-600';
      case 'Node Selected': return 'bg-cyan-600';
      case 'Network Search': return 'bg-indigo-600';
      default: return 'bg-gray-600';
    }
  };

  const uniqueActions = [...new Set(logs.map(log => log.action))];

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl mb-2">Audit Log</h1>
        <p className="text-muted-foreground">Complete system activity and user action tracking</p>
      </div>

      {/* Search and Filter Controls */}
      <Card className="p-6 mb-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Search audit logs by action, user, or details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-input-background"
            />
          </div>
          <div className="w-48">
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {uniqueActions.map(action => (
                  <SelectItem key={action} value={action}>{action}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </Button>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">Total Entries:</span>
          <Badge variant="outline">{filteredLogs.length}</Badge>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">Showing latest activity first</span>
        </div>
      </Card>

      {/* Audit Log Table */}
      <Card className="flex-1 overflow-hidden">
        <div className="overflow-auto h-full">
          <table className="w-full">
            <thead className="bg-muted sticky top-0">
              <tr>
                <th className="text-left p-4 border-b border-border">Action</th>
                <th className="text-left p-4 border-b border-border">User</th>
                <th className="text-left p-4 border-b border-border">Timestamp</th>
                <th className="text-left p-4 border-b border-border">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-accent/50 border-b border-border">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {getActionIcon(log.action)}
                      <Badge className={`text-white text-xs ${getActionColor(log.action)}`}>
                        {log.action}
                      </Badge>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="text-sm">{log.user}</p>
                      <p className="text-xs text-muted-foreground">ID: IO_001</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-mono">{log.timestamp}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-muted-foreground">{log.details}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <h3 className="text-lg mb-2">No audit logs found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </Card>
      
      {/* Export Controls */}
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" size="sm">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </Button>
        <Button variant="outline" size="sm">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print
        </Button>
      </div>
    </div>
  );
}