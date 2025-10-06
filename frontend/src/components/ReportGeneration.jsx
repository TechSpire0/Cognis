import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

export function ReportGeneration({ caseData, addAuditLog }) {
  const [reportData] = useState({
    title: 'Digital Forensic Investigation Report - Case #2024-001',
    investigator: 'Detective Sarah Chen',
    generationDate: new Date().toLocaleDateString(),
    summary: {
      content: `This investigation revealed significant digital evidence linking the primary suspect to cryptocurrency transactions and suspicious communications. Analysis of mobile device extractions shows coordinated activity between multiple parties, with cryptocurrency addresses serving as central points of contact. The evidence suggests a structured operation with clear communication patterns and financial flows.

Key findings include 23 cryptocurrency transactions totaling $127,000, communication with 8 distinct phone numbers, and location data indicating meetings at predetermined locations. The investigation timeline spans January 10-15, 2024, with peak activity occurring on January 14th.`,
      citations: ['MSG_001', 'MSG_047', 'TXN_002', 'CALL_001', 'LOC_001', 'CONTACT_001']
    },
    evidenceList: [
      {
        id: 'MSG_001',
        type: 'WhatsApp Message',
        content: 'Meeting at bitcoin address 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa tomorrow at 3pm',
        timestamp: '2024-01-14 15:30:22',
        significance: 'Critical - Links suspect to cryptocurrency activity'
      },
      {
        id: 'CALL_001',
        type: 'Phone Call Log',
        content: 'Outgoing call to +1-555-0123 (John Doe) duration 5:23',
        timestamp: '2024-01-14 14:22:11',
        significance: 'High - Communication with known associate'
      },
      {
        id: 'TXN_002',
        type: 'Blockchain Transaction',
        content: 'Transfer of 0.75 BTC to address 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        timestamp: '2024-01-14 16:15:33',
        significance: 'Critical - Financial evidence of transaction'
      },
      {
        id: 'LOC_001',
        type: 'GPS Location',
        content: 'Device location: 40.7128,-74.0060 (Financial District, NYC)',
        timestamp: '2024-01-14 15:45:12',
        significance: 'Medium - Corroborates meeting location'
      }
    ],
    networkSummary: {
      totalNodes: 15,
      totalConnections: 34,
      centralEntities: ['John Doe', '+1-555-0123', '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'],
      suspiciousPatterns: 3
    }
  });

  const handleExportPDF = () => {
    addAuditLog('Report Exported', 'PDF report generated and downloaded');
    // Mock PDF generation
    alert('PDF report would be generated and downloaded');
  };

  const handleExportDOCX = () => {
    addAuditLog('Report Exported', 'DOCX report generated and downloaded');
    // Mock DOCX generation
    alert('DOCX report would be generated and downloaded');
  };

  const getSignificanceColor = (significance) => {
    switch (significance.split(' - ')[0]) {
      case 'Critical': return 'bg-red-600';
      case 'High': return 'bg-orange-600';
      case 'Medium': return 'bg-yellow-600';
      case 'Low': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden">
      <div className="p-8 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl mb-2">Report Generation</h1>
              <p className="text-muted-foreground">Automated forensic analysis report with AI insights</p>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleExportPDF} className="bg-red-600 hover:bg-red-700">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </Button>
              <Button onClick={handleExportDOCX} variant="outline">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download DOCX
              </Button>
            </div>
          </div>

          {/* System Status */}
          <div className="flex items-center gap-6 text-sm mb-8 p-4 bg-card rounded-lg border">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-muted-foreground">Report Generation System</span>
              <span className="text-green-500">Online</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-muted-foreground">Analysis Engine</span>
              <span className="text-blue-500">Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-muted-foreground">PDF Generator</span>
              <span className="text-yellow-500">Processing</span>
            </div>
          </div>
          {/* Report Content */}
            <Card className="p-8 bg-white text-black">
              {/* Report Header */}
              <div className="border-b-2 border-gray-300 pb-6 mb-8">
                <h1 className="text-2xl font-bold text-center mb-4">{reportData.title}</h1>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Lead Investigator:</strong> {reportData.investigator}</p>
                    <p><strong>Badge ID:</strong> IO_001</p>
                  </div>
                  <div className="text-right">
                    <p><strong>Report Generated:</strong> {reportData.generationDate}</p>
                    <p><strong>Case Status:</strong> Active Investigation</p>
                  </div>
                </div>
              </div>

              {/* Executive Summary */}
              <section className="mb-8">
                <h2 className="text-xl font-bold mb-4">Executive Summary</h2>
                <div className="bg-gray-50 p-4 rounded border-l-4 border-blue-500">
                  <p className="leading-relaxed whitespace-pre-line">{reportData.summary.content}</p>
                  
                  <div className="mt-4 pt-4 border-t border-gray-300">
                    <p className="text-sm font-semibold mb-2">Source Artifacts:</p>
                    <div className="flex flex-wrap gap-2">
                      {reportData.summary.citations.map((citation, index) => (
                        <Badge key={index} variant="outline" className="font-mono text-xs">
                          {citation}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Network Analysis Summary */}
              <section className="mb-8">
                <h2 className="text-xl font-bold mb-4">Network Analysis Summary</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded text-center">
                    <p className="text-2xl font-bold text-blue-600">{reportData.networkSummary.totalNodes}</p>
                    <p className="text-sm text-gray-600">Total Entities</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded text-center">
                    <p className="text-2xl font-bold text-green-600">{reportData.networkSummary.totalConnections}</p>
                    <p className="text-sm text-gray-600">Connections</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded text-center">
                    <p className="text-2xl font-bold text-yellow-600">{reportData.networkSummary.centralEntities.length}</p>
                    <p className="text-sm text-gray-600">Central Entities</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded text-center">
                    <p className="text-2xl font-bold text-red-600">{reportData.networkSummary.suspiciousPatterns}</p>
                    <p className="text-sm text-gray-600">Suspicious Patterns</p>
                  </div>
                </div>
              </section>

              <Separator className="my-8" />

              {/* Evidence List */}
              <section className="mb-8">
                <h2 className="text-xl font-bold mb-4">Compiled Evidence</h2>
                <div className="space-y-4">
                  {reportData.evidenceList.map((evidence, index) => (
                    <div key={evidence.id} className="border border-gray-300 rounded p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="font-mono text-xs">
                            {evidence.id}
                          </Badge>
                          <span className="text-sm font-semibold">{evidence.type}</span>
                        </div>
                        <div className="text-right text-sm text-gray-600">
                          <p>{evidence.timestamp}</p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded mb-3">
                        <p className="text-sm font-mono">{evidence.content}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={`text-white text-xs ${getSignificanceColor(evidence.significance)}`}>
                          {evidence.significance.split(' - ')[0]}
                        </Badge>
                        <span className="text-sm text-gray-600">{evidence.significance.split(' - ')[1]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Network Visualization
              <section className="mb-8">
                <h2 className="text-xl font-bold mb-4">Network Visualization</h2>
                <div className="bg-gray-100 p-8 rounded text-center">
                  <svg viewBox="0 0 400 300" className="w-full max-w-md mx-auto">
                    {/* Simplified network graph for report */}
                    {/* <circle cx="200" cy="150" r="20" fill="#3B82F6" />
                    <circle cx="120" cy="100" r="15" fill="#10B981" />
                    <circle cx="280" cy="100" r="15" fill="#F59E0B" />
                    <circle cx="120" cy="200" r="15" fill="#EF4444" />
                    <circle cx="280" cy="200" r="15" fill="#8B5CF6" /> */}
                    
                    {/* <line x1="200" y1="150" x2="120" y2="100" stroke="#444" strokeWidth="2" />
                    <line x1="200" y1="150" x2="280" y2="100" stroke="#444" strokeWidth="2" />
                    <line x1="200" y1="150" x2="120" y2="200" stroke="#444" strokeWidth="2" />
                    <line x1="200" y1="150" x2="280" y2="200" stroke="#444" strokeWidth="2" />
                     */}
                    {/* <text x="200" y="180" textAnchor="middle" fontSize="12" fill="#333">John Doe</text>
                    <text x="120" y="90" textAnchor="middle" fontSize="10" fill="#333">Phone</text>
                    <text x="280" y="90" textAnchor="middle" fontSize="10" fill="#333">Crypto</text>
                    <text x="120" y="220" textAnchor="middle" fontSize="10" fill="#333">Location</text>
                    <text x="280" y="220" textAnchor="middle" fontSize="10" fill="#333">File</text>
                  </svg>
                  <p className="text-sm text-gray-600 mt-4">Network relationship diagram showing key entity connections</p>
                </div>
              </section> */}

              {/* Footer */}
              <div className="border-t-2 border-gray-300 pt-6 mt-8 text-sm text-gray-600">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p><strong>Report Classification:</strong> Law Enforcement Sensitive</p>
                    <p><strong>Distribution:</strong> Authorized Personnel Only</p>
                  </div>
                  <div className="text-right">
                    <p><strong>Generated by:</strong> AI Forensic Assistant v2.1</p>
                    <p><strong>Page 1 of 1</strong></p>
                  </div>
                </div>
              </div>
            </Card>
        </div>
      </div>
    </div>
  );
}