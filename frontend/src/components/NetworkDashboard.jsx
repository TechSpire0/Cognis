import React, { useState, useRef, useEffect } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export function NetworkDashboard({ caseData, addAuditLog }) {
  const canvasRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [detectedEntities] = useState([
    { id: 1, type: 'Person', name: 'John Doe', connections: 15, status: 'Primary Suspect' },
    { id: 2, type: 'Phone', name: '+1-555-0123', connections: 8, status: 'Active' },
    { id: 3, type: 'Location', name: 'New York, NY', connections: 12, status: 'Frequent' },
    { id: 4, type: 'File', name: 'transfer_001.jpg', connections: 3, status: 'Evidence' }
  ]);

  const [networkData] = useState({
    nodes: [
      { id: 'john_doe', type: 'person', x: 200, y: 200, name: 'John Doe', size: 20 },
      { id: 'phone_123', type: 'phone', x: 350, y: 150, name: '+1-555-0123', size: 15 },
      { id: 'location_1', type: 'location', x: 150, y: 350, name: 'New York, NY', size: 16 },
      { id: 'file_1', type: 'file', x: 400, y: 250, name: 'transfer_001.jpg', size: 12 }
    ],
    edges: [
      { from: 'john_doe', to: 'phone_123', type: 'owns', weight: 5 },
      { from: 'phone_123', to: 'location_1', type: 'located_at', weight: 8 },
      { from: 'john_doe', to: 'location_1', type: 'visited', weight: 4 },
      { from: 'john_doe', to: 'file_1', type: 'created', weight: 3 }
    ]
  });

  useEffect(() => {
    drawNetwork();
  }, []);

  const drawNetwork = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges
    networkData.edges.forEach(edge => {
      const fromNode = networkData.nodes.find(n => n.id === edge.from);
      const toNode = networkData.nodes.find(n => n.id === edge.to);
      
      if (fromNode && toNode) {
        ctx.strokeStyle = '#444';
        ctx.lineWidth = edge.weight / 2;
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.stroke();
      }
    });

    // Draw nodes
    networkData.nodes.forEach(node => {
      const colors = {
        person: '#3B82F6',
        phone: '#10B981',
        location: '#EF4444',
        file: '#8B5CF6'
      };

      ctx.fillStyle = colors[node.type];
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size, 0, 2 * Math.PI);
      ctx.fill();

      // Node label
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.name, node.x, node.y + node.size + 15);
    });
  };

  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find clicked node
    const clickedNode = networkData.nodes.find(node => {
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      return distance <= node.size;
    });

    if (clickedNode) {
      setSelectedNode(clickedNode);
      addAuditLog('Node Selected', `Selected ${clickedNode.type}: ${clickedNode.name}`);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      addAuditLog('Network Search', `Searched for: "${searchQuery}"`);
    }
  };

  const getEntityIcon = (type) => {
    switch (type) {
      case 'Person':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'Phone':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        );

      case 'Location':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'File':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Primary Suspect': return 'bg-red-600';
      case 'High Value': return 'bg-orange-600';
      case 'Active': return 'bg-green-600';
      case 'Evidence': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="p-8 h-full flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col mr-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl mb-2">Network Dashboard</h1>
              <p className="text-muted-foreground">Interconnectivity analysis and relationship mapping</p>
            </div>
            <div className="flex gap-2">
              <Button className="bg-green-600 hover:bg-green-700">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Export Report
              </Button>
              <Button variant="outline">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Save Case
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search entities, relationships, or ask natural language questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="bg-input-background"
              />
            </div>
            <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </Button>
          </div>
        </div>

        {/* Network Graph */}
        <Card className="flex-1 p-6">
          <div className="h-full relative">
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              onClick={handleCanvasClick}
              className="border border-border rounded cursor-pointer bg-card"
            />
            <div className="absolute top-4 left-4 bg-muted/90 backdrop-blur-sm rounded-lg p-3">
              <p className="text-sm text-muted-foreground mb-2">Entity Types:</p>
              <div className="flex flex-col gap-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Persons</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Phone Numbers</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Locations</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span>Files</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 space-y-6">
        {/* Detected Entities */}
        <Card className="p-4">
          <h3 className="mb-4">Detected Entities</h3>
          <div className="space-y-3">
            {detectedEntities.map((entity) => (
              <div key={entity.id} className="flex items-center justify-between p-2 rounded border border-border">
                <div className="flex items-center gap-2">
                  {getEntityIcon(entity.type)}
                  <div>
                    <p className="text-sm truncate">{entity.name}</p>
                    <p className="text-xs text-muted-foreground">{entity.connections} connections</p>
                  </div>
                </div>
                <Badge className={`text-white text-xs ${getStatusColor(entity.status)}`}>
                  {entity.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Contextual Detail Panel */}
        <Card className="p-4">
          <h3 className="mb-4">Detail Panel</h3>
          {selectedNode ? (
            <div>
              <div className="mb-3">
                <p className="text-sm text-muted-foreground">Selected Entity</p>
                <h4 className="text-lg">{selectedNode.name}</h4>
                <Badge variant="outline" className="text-xs">{selectedNode.type}</Badge>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded border-l-4 border-blue-500">
                  <p className="text-sm">
                    <span className="text-blue-400">MSG_001:</span> "Meeting at the office tomorrow at 3pm"
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Source: WhatsApp</p>
                </div>
                
                <div className="p-3 bg-muted rounded border-l-4 border-green-500">
                  <p className="text-sm">
                    <span className="text-green-400">CALL_002:</span> "Outgoing call to +1-555-0123 duration 3:45"
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Source: Phone System</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-muted-foreground mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              <p className="text-muted-foreground text-sm">Click on a node to view details</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}