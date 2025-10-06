import React, { useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export function AdminPanel({ logs, addAuditLog, activeTab = 'cases' }) {
  const [cases, setCases] = useState([
    {
      id: 'CASE-2024-001',
      name: 'WhatsApp Data Analysis',
      status: 'Active',
      assignedTo: 'Detective Sarah Chen',
      createdDate: '2024-01-15',
      description: 'Investigation of suspected fraud involving WhatsApp communications'
    },
    {
      id: 'CASE-2024-002',
      name: 'Digital Device Forensics',
      status: 'Pending',
      assignedTo: 'Unassigned',
      createdDate: '2024-01-16',
      description: 'Forensic analysis of seized mobile devices'
    },
    {
      id: 'CASE-2024-003',
      name: 'Network Traffic Analysis',
      status: 'Completed',
      assignedTo: 'Detective John Martinez',
      createdDate: '2024-01-10',
      description: 'Analysis of suspicious network traffic patterns'
    }
  ]);

  const investigators = [
    { id: 'IO_001', name: 'Detective Sarah Chen', status: 'Available' },
    { id: 'IO_002', name: 'Detective John Martinez', status: 'Busy' },
    { id: 'IO_003', name: 'Detective Maria Rodriguez', status: 'Available' },
    { id: 'IO_004', name: 'Detective Michael Brown', status: 'Busy' }
  ];

  const [newCase, setNewCase] = useState({
    name: '',
    assignedTo: 'unassigned',
    description: ''
  });

  const handleAssignCase = (caseId, investigatorId) => {
    const investigator = investigators.find(inv => inv.id === investigatorId);
    if (!investigator) return;

    setCases(cases.map(c => 
      c.id === caseId 
        ? { ...c, assignedTo: investigator.name, status: 'Active' }
        : c
    ));
    
    addAuditLog('Case Assignment', `Case ${caseId} assigned to ${investigator.name}`);
  };

  const handleCreateCase = () => {
    if (!newCase.name.trim()) return;

    const caseId = `CASE-2024-${String(cases.length + 1).padStart(3, '0')}`;
    const newCaseData = {
      id: caseId,
      name: newCase.name,
      status: newCase.assignedTo && newCase.assignedTo !== 'unassigned' ? 'Active' : 'Pending',
      assignedTo: newCase.assignedTo && newCase.assignedTo !== 'unassigned' ? newCase.assignedTo : 'Unassigned',
      createdDate: new Date().toISOString().split('T')[0],
      description: newCase.description
    };

    setCases([newCaseData, ...cases]);
    addAuditLog('Case Created', `New case ${caseId} created: ${newCase.name}`);
    
    setNewCase({ name: '', assignedTo: 'unassigned', description: '' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-600';
      case 'Pending': return 'bg-yellow-600';
      case 'Completed': return 'bg-blue-600';
      case 'On Hold': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 p-6 pb-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-blue-400">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">System Administration & Case Management</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-6 pt-4">
        <Tabs value={activeTab} className="h-full flex flex-col">
          <TabsList className="bg-card flex-shrink-0 mb-4">
            <TabsTrigger value="cases">Case Management</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="cases" className="flex-1 overflow-hidden">
            <div className="h-full flex flex-col gap-6">
              {/* Create New Case - Fixed at top */}
              <Card className="p-6 flex-shrink-0">
                <h3 className="mb-4">Create New Case</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm mb-2">Case Name</label>
                    <Input
                      value={newCase.name}
                      onChange={(e) => setNewCase({ ...newCase, name: e.target.value })}
                      placeholder="Enter case name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Assign to Investigator</label>
                    <Select value={newCase.assignedTo} onValueChange={(value) => setNewCase({ ...newCase, assignedTo: value === 'unassigned' ? '' : value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select investigator (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {investigators.filter(inv => inv.status === 'Available').map(inv => (
                          <SelectItem key={inv.id} value={inv.name}>{inv.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm mb-2">Description</label>
                    <Input
                      value={newCase.description}
                      onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                      placeholder="Case description"
                    />
                  </div>
                </div>
                <Button onClick={handleCreateCase} className="bg-blue-600 hover:bg-blue-700">
                  Create Case
                </Button>
              </Card>

              {/* Cases List - Scrollable */}
              <Card className="p-6 flex-1 overflow-hidden">
                <h3 className="mb-4">Active Cases ({cases.length} total)</h3>
                <div className="h-full overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                  {cases.map((caseItem) => (
                    <div key={caseItem.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-blue-400">{caseItem.name}</h4>
                          <p className="text-sm text-muted-foreground">Case ID: {caseItem.id}</p>
                          <p className="text-sm mt-1 break-words">{caseItem.description}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0 ml-4">
                          <Badge className={getStatusColor(caseItem.status)}>
                            {caseItem.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Assigned to: </span>
                          <span className="text-foreground">{caseItem.assignedTo}</span>
                          <span className="text-muted-foreground ml-4">Created: </span>
                          <span className="text-foreground">{caseItem.createdDate}</span>
                        </div>
                        {caseItem.status === 'Pending' && (
                          <Select onValueChange={(value) => handleAssignCase(caseItem.id, value)}>
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Assign to investigator" />
                            </SelectTrigger>
                            <SelectContent>
                              {investigators.filter(inv => inv.status === 'Available').map(inv => (
                                <SelectItem key={inv.id} value={inv.id}>{inv.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="audit" className="flex-1 overflow-hidden">
            <Card className="p-6 h-full overflow-hidden">
              <h3 className="mb-4">System Audit Logs ({logs.length} entries)</h3>
              <div className="h-full overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                {logs.map((log) => (
                  <div key={log.id} className="border-l-4 border-blue-500 pl-4 py-3 hover:bg-muted/30 rounded-r transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">{log.action}</Badge>
                        <span className="text-sm">{log.user}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                    </div>
                    <p className="text-sm text-muted-foreground break-words">{log.details}</p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}