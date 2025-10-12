import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { FolderPlus, UserPlus, Edit, Search, UserX, MoreVertical, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export function CaseManagement() {
  const [cases, setCases] = useState([
    { id: "2025-001", title: "Operation Thunder", investigator: "John Doe", status: "In Progress", priority: "High", created: "2025-10-01" },
    { id: "2025-002", title: "Crypto Investigation", investigator: "Jane Smith", status: "Not Started", priority: "Medium", created: "2025-10-03" },
    { id: "2025-003", title: "Border Surveillance", investigator: "Mike Johnson", status: "Completed", priority: "High", created: "2025-09-28" },
    { id: "2025-004", title: "Dark Web Analysis", investigator: "Unassigned", status: "Not Started", priority: "Critical", created: "2025-10-05" },
    { id: "2025-005", title: "Terrorism Link", investigator: "Sarah Williams", status: "In Progress", priority: "Critical", created: "2025-10-02" },
    { id: "2025-006", title: "Money Laundering", investigator: "Unassigned", status: "Not Started", priority: "High", created: "2025-10-07" },
  ]);

  const [searchQuery, setSearchQuery] = useState("");

  const handleUnassign = (caseId) => {
    setCases(cases.map(c => 
      c.id === caseId ? { ...c, investigator: "Unassigned" } : c
    ));
  };

  const investigators = ["John Doe", "Jane Smith", "Mike Johnson", "Sarah Williams", "Robert Brown"];

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-[#00BFA5]/20 text-[#00BFA5] border-[#00BFA5]";
      case "In Progress":
        return "bg-[#6C63FF]/20 text-[#6C63FF] border-[#6C63FF]";
      case "Not Started":
        return "bg-[#9BA1A6]/20 text-[#9BA1A6] border-[#9BA1A6]";
      default:
        return "bg-[#9BA1A6]/20 text-[#9BA1A6] border-[#9BA1A6]";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Critical":
        return "bg-[#FF5252]/20 text-[#FF5252] border-[#FF5252]";
      case "High":
        return "bg-[#6C63FF]/20 text-[#6C63FF] border-[#6C63FF]";
      case "Medium":
        return "bg-[#03DAC6]/20 text-[#03DAC6] border-[#03DAC6]";
      case "Low":
        return "bg-[#9BA1A6]/20 text-[#9BA1A6] border-[#9BA1A6]";
      default:
        return "bg-[#9BA1A6]/20 text-[#9BA1A6] border-[#9BA1A6]";
    }
  };

  const filteredCases = cases.filter(caseItem => 
    caseItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    caseItem.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const assignedCases = filteredCases.filter(c => c.investigator !== "Unassigned");
  const unassignedCases = filteredCases.filter(c => c.investigator === "Unassigned");

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="p-14">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-[#E6EDF3] mb-2">Case Management</h1>
            <p className="text-[#9BA1A6]">Manage and assign cases to investigators</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-[#00BFA5] text-[#0D1117] hover:bg-[#03DAC6]">
                <FolderPlus className="w-4 h-4 mr-2" />
                Add New Case
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#161B22] border-[#30363D] text-[#E6EDF3]">
              <DialogHeader>
                <DialogTitle className="text-[#E6EDF3]">Create New Case</DialogTitle>
                <DialogDescription className="text-[#9BA1A6]">
                  Add a new case and assign to an investigator
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-[#E6EDF3]">Case ID</Label>
                  <Input
                    placeholder="e.g., 2025-007"
                    className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#E6EDF3]">Case Title</Label>
                  <Input
                    placeholder="Enter case title"
                    className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#E6EDF3]">Assign to Investigator</Label>
                  <Select>
                    <SelectTrigger className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3]">
                      <SelectValue placeholder="Select investigator" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#161B22] border-[#30363D]">
                      {investigators.map((inv) => (
                        <SelectItem key={inv} value={inv} className="text-[#E6EDF3]">
                          {inv}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#E6EDF3]">Priority</Label>
                  <Select>
                    <SelectTrigger className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3]">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#161B22] border-[#30363D]">
                      <SelectItem value="critical" className="text-[#E6EDF3]">Critical</SelectItem>
                      <SelectItem value="high" className="text-[#E6EDF3]">High</SelectItem>
                      <SelectItem value="medium" className="text-[#E6EDF3]">Medium</SelectItem>
                      <SelectItem value="low" className="text-[#E6EDF3]">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full bg-[#00BFA5] text-[#0D1117] hover:bg-[#03DAC6]">
                  Create Case
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card className="bg-[#161B22] border-[#30363D] mb-6 card-glow">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-4 top-4 w-5 h-5 text-[#9BA1A6]" />
              <Input
                type="text"
                placeholder="Search cases by ID or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base bg-[#0D1117] border-[#30363D] text-[#E6EDF3] placeholder:text-[#9BA1A6]/60"
              />
            </div>
          </CardContent>
        </Card>

        {/* Cases Tabs */}
        <Tabs defaultValue="assigned" className="w-full">
          <TabsList className="bg-[#161B22] border border-[#30363D]">
            <TabsTrigger value="assigned" className="data-[state=active]:bg-[#00BFA5] data-[state=active]:text-[#0D1117]">
              Assigned Cases ({assignedCases.length})
            </TabsTrigger>
            <TabsTrigger value="unassigned" className="data-[state=active]:bg-[#00BFA5] data-[state=active]:text-[#0D1117]">
              Unassigned Cases ({unassignedCases.length})
            </TabsTrigger>
          </TabsList>

          {/* Assigned Cases */}
          <TabsContent value="assigned" className="mt-6">
            <Card className="bg-[#161B22] border-[#30363D] card-glow">
              <CardHeader>
                <CardTitle className="text-[#E6EDF3]">Assigned Cases</CardTitle>
                <CardDescription className="text-[#9BA1A6]">
                  Cases currently assigned to investigators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border border-[#30363D] rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-[#0D1117]">
                      <TableRow className="border-[#30363D] hover:bg-[#0D1117]">
                        <TableHead className="text-[#E6EDF3] h-14 text-base">Case ID</TableHead>
                        <TableHead className="text-[#E6EDF3] h-14 text-base">Title</TableHead>
                        <TableHead className="text-[#E6EDF3] h-14 text-base">Investigator</TableHead>
                        <TableHead className="text-[#E6EDF3] h-14 text-base">Status</TableHead>
                        <TableHead className="text-[#E6EDF3] h-14 text-base">Priority</TableHead>
                        <TableHead className="text-[#E6EDF3] h-14 text-base">Created</TableHead>
                        <TableHead className="text-[#E6EDF3] h-14 text-base">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignedCases.map((caseItem, index) => (
                        <TableRow 
                          key={caseItem.id} 
                          className={`border-[#30363D] hover:bg-[#0D1117] transition-colors ${
                            index % 2 === 1 ? 'bg-[#0D1117]/30' : ''
                          }`}
                        >
                          <TableCell className="text-[#00BFA5] h-16 text-base">{caseItem.id}</TableCell>
                          <TableCell className="text-[#E6EDF3] h-16 text-base">{caseItem.title}</TableCell>
                          <TableCell className="text-[#9BA1A6] h-16 text-base">{caseItem.investigator}</TableCell>
                          <TableCell className="h-16">
                            <Badge className={getStatusColor(caseItem.status)}>
                              {caseItem.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="h-16">
                            <Badge className={getPriorityColor(caseItem.priority)}>
                              {caseItem.priority}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-[#9BA1A6] h-16 text-base">{caseItem.created}</TableCell>
                          <TableCell className="h-16">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-8 w-8 p-0 text-[#9BA1A6] hover:text-[#E6EDF3] hover:bg-[#161B22]"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-[#161B22] border-[#30363D]">
                                <DropdownMenuItem className="text-[#E6EDF3] focus:bg-[#00BFA5]/10 focus:text-[#00BFA5]">
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-[#E6EDF3] focus:bg-[#6C63FF]/10 focus:text-[#6C63FF]">
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Case
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleUnassign(caseItem.id)}
                                  className="text-[#E6EDF3] focus:bg-[#FF5252]/10 focus:text-[#FF5252]"
                                >
                                  <UserX className="w-4 h-4 mr-2" />
                                  Unassign
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Unassigned Cases */}
          <TabsContent value="unassigned" className="mt-6">
            <Card className="bg-[#161B22] border-[#30363D] card-glow">
              <CardHeader>
                <CardTitle className="text-[#E6EDF3]">Unassigned Cases</CardTitle>
                <CardDescription className="text-[#9BA1A6]">
                  Cases waiting to be assigned to investigators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {unassignedCases.map((caseItem) => (
                  <div 
                    key={caseItem.id}
                    className="p-4 bg-[#0D1117] border border-[#30363D] rounded-lg hover:border-[#00BFA5] transition-all glow-hover"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="text-[#00BFA5]">{caseItem.id}</p>
                          <Badge className={getPriorityColor(caseItem.priority)}>
                            {caseItem.priority}
                          </Badge>
                        </div>
                        <p className="text-[#E6EDF3] mb-1">{caseItem.title}</p>
                        <p className="text-[#9BA1A6] text-sm">Created: {caseItem.created}</p>
                      </div>
                      <Button className="bg-[#00BFA5] text-[#0D1117] hover:bg-[#03DAC6]">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Assign
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
