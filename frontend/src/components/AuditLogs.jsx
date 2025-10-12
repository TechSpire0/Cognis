import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Search, Activity, Upload, FileText, User, Calendar } from "lucide-react";

export function AuditLogs() {
  const [logs] = useState([
    { id: 1, timestamp: "2025-10-08 14:23:45", user: "John Doe", action: "Uploaded UFDR", details: "UFDR_2025_047.xml", status: "Success" },
    { id: 2, timestamp: "2025-10-08 13:45:12", user: "Jane Smith", action: "Generated Report", details: "Case #2025-046", status: "Success" },
    { id: 3, timestamp: "2025-10-08 12:30:22", user: "Mike Johnson", action: "Search Query", details: "Query: international calls", status: "Success" },
    { id: 4, timestamp: "2025-10-08 11:15:33", user: "Admin User", action: "Assigned Case", details: "Case #2025-048 to Sarah Williams", status: "Success" },
    { id: 5, timestamp: "2025-10-08 10:20:18", user: "Sarah Williams", action: "Uploaded UFDR", details: "UFDR_2025_048.xml", status: "Success" },
    { id: 6, timestamp: "2025-10-08 09:45:55", user: "Robert Brown", action: "Login Attempt", details: "Failed authentication", status: "Failed" },
    { id: 7, timestamp: "2025-10-07 16:30:42", user: "John Doe", action: "Search Query", details: "Query: crypto addresses", status: "Success" },
    { id: 8, timestamp: "2025-10-07 15:22:11", user: "Jane Smith", action: "Downloaded Report", details: "Case #2025-045 PDF", status: "Success" },
    { id: 9, timestamp: "2025-10-07 14:10:05", user: "Mike Johnson", action: "Case Update", details: "Updated Case #2025-047 status", status: "Success" },
    { id: 10, timestamp: "2025-10-07 13:05:33", user: "Admin User", action: "User Created", details: "New investigator account: NIA-006", status: "Success" },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");

  const getStatusColor = (status) => {
    return status === "Success"
      ? "bg-[#00BFA5]/20 text-[#00BFA5] border-[#00BFA5]"
      : "bg-[#FF5252]/20 text-[#FF5252] border-[#FF5252]";
  };

  const getActionIcon = (action) => {
    if (action.includes("Upload")) return <Upload className="w-4 h-4 text-[#00BFA5]" />;
    if (action.includes("Report") || action.includes("Download")) return <FileText className="w-4 h-4 text-[#6C63FF]" />;
    if (action.includes("Search")) return <Search className="w-4 h-4 text-[#03DAC6]" />;
    if (action.includes("Login") || action.includes("Assigned") || action.includes("User")) return <User className="w-4 h-4 text-[#9BA1A6]" />;
    return <Activity className="w-4 h-4 text-[#9BA1A6]" />;
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchQuery === "" ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAction =
      actionFilter === "all" ||
      (actionFilter === "upload" && log.action.includes("Upload")) ||
      (actionFilter === "search" && log.action.includes("Search")) ||
      (actionFilter === "report" && (log.action.includes("Report") || log.action.includes("Download"))) ||
      (actionFilter === "auth" && (log.action.includes("Login") || log.action.includes("User")));

    const matchesTime = timeFilter === "all" || timeFilter === "today";

    return matchesSearch && matchesAction && matchesTime;
  });

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="p-14">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[#E6EDF3] mb-2">Audit Logs</h1>
          <p className="text-[#9BA1A6]">Track investigator actions and system activity</p>
        </div>

        {/* Filters */}
        <Card className="bg-[#161B22] border-[#30363D] mb-6 card-glow">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="relative flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-[#9BA1A6] z-10 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-base bg-[#0D1117] border-[#30363D] text-[#E6EDF3] placeholder:text-[#9BA1A6]/60 w-full"
                />
              </div>
              <div className="flex items-center">
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="h-12 text-base bg-[#0D1117] border-[#30363D] text-[#E6EDF3] w-full">
                    <SelectValue placeholder="Filter by action" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#161B22] border-[#30363D]">
                    <SelectItem value="all" className="text-[#E6EDF3]">All Actions</SelectItem>
                    <SelectItem value="upload" className="text-[#E6EDF3]">Uploads</SelectItem>
                    <SelectItem value="search" className="text-[#E6EDF3]">Searches</SelectItem>
                    <SelectItem value="report" className="text-[#E6EDF3]">Reports</SelectItem>
                    <SelectItem value="auth" className="text-[#E6EDF3]">Authentication</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center">
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="h-12 text-base bg-[#0D1117] border-[#30363D] text-[#E6EDF3] w-full">
                    <SelectValue placeholder="Time range" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#161B22] border-[#30363D]">
                    <SelectItem value="all" className="text-[#E6EDF3]">All Time</SelectItem>
                    <SelectItem value="today" className="text-[#E6EDF3]">Today</SelectItem>
                    <SelectItem value="week" className="text-[#E6EDF3]">This Week</SelectItem>
                    <SelectItem value="month" className="text-[#E6EDF3]">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-6">
          <p className="text-[#9BA1A6]">
            Showing <span className="text-[#E6EDF3]">{filteredLogs.length}</span> of <span className="text-[#E6EDF3]">{logs.length}</span> logs
          </p>
        </div>

        {/* Logs Table */}
        <Card className="bg-[#161B22] border-[#30363D] card-glow">
          <CardHeader>
            <CardTitle className="text-[#E6EDF3]">Activity Log</CardTitle>
            <CardDescription className="text-[#9BA1A6]">
              Detailed system actions and security events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border border-[#30363D] rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-[#0D1117]">
                  <TableRow className="border-[#30363D] hover:bg-[#0D1117]">
                    <TableHead className="text-[#E6EDF3] h-14 text-base">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Timestamp
                      </div>
                    </TableHead>
                    <TableHead className="text-[#E6EDF3] h-14 text-base">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        User
                      </div>
                    </TableHead>
                    <TableHead className="text-[#E6EDF3] h-14 text-base">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Action
                      </div>
                    </TableHead>
                    <TableHead className="text-[#E6EDF3] h-14 text-base">Details</TableHead>
                    <TableHead className="text-[#E6EDF3] h-14 text-base">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log, index) => (
                    <TableRow
                      key={log.id}
                      className={`border-[#30363D] hover:bg-[#0D1117] transition-colors ${
                        index % 2 === 1 ? 'bg-[#0D1117]/30' : ''
                      }`}
                    >
                      <TableCell className="text-[#9BA1A6] h-16 text-base">{log.timestamp}</TableCell>
                      <TableCell className="text-[#E6EDF3] h-16 text-base">{log.user}</TableCell>
                      <TableCell className="h-16">
                        <div className="flex items-center gap-2 text-[#E6EDF3] text-base">
                          {getActionIcon(log.action)}
                          {log.action}
                        </div>
                      </TableCell>
                      <TableCell className="text-[#9BA1A6] h-16 text-base">{log.details}</TableCell>
                      <TableCell className="h-16">
                        <Badge className={getStatusColor(log.status)}>
                          {log.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
