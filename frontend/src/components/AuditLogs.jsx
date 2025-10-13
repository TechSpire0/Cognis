// src/components/AuditLogs.jsx
import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Search,
  Activity,
  Calendar,
  FileText,
  User,
  RotateCcw,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "sonner";
import { getAuditLogs } from "../services/api";

/**
 * AuditLogs component
 * - shows authenticated user actions + unauthorized 401/403
 * - hides system/background-only entries (non-user & not 401/403)
 * - Refresh button with spinner
 */

export function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAuditLogs();
      setLogs(data || []);
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
      toast.error("Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getStatusColor = (statusCode) => {
    if (statusCode >= 200 && statusCode < 300)
      return "bg-[#00BFA5]/20 text-[#00BFA5] border-[#00BFA5]";
    if (statusCode >= 400)
      return "bg-[#FF5252]/20 text-[#FF5252] border-[#FF5252]";
    return "bg-[#9BA1A6]/20 text-[#9BA1A6] border-[#9BA1A6]";
  };

  const getActionIcon = (method) => {
    switch (method) {
      case "POST":
        return <FileText className="w-4 h-4 text-[#6C63FF]" />;
      case "GET":
        return <Search className="w-4 h-4 text-[#03DAC6]" />;
      case "DELETE":
        return <Activity className="w-4 h-4 text-[#FF5252]" />;
      case "PATCH":
        return <User className="w-4 h-4 text-[#00BFA5]" />;
      default:
        return <Activity className="w-4 h-4 text-[#9BA1A6]" />;
    }
  };

  // Visible logs: either have a user OR are unauthorized attempts (401/403)
  const visibleLogs = logs.filter(
    (log) =>
      log.user?.username || log.status_code === 401 || log.status_code === 403
  );

  const filteredLogs = visibleLogs.filter((log) => {
    const matchesSearch =
      searchQuery === "" ||
      (log.path &&
        log.path.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.method &&
        log.method.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.user_agent &&
        log.user_agent.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.ip_address &&
        log.ip_address.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesMethod = methodFilter === "all" || log.method === methodFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "success" && log.status_code < 400) ||
      (statusFilter === "error" && log.status_code >= 400);

    return matchesSearch && matchesMethod && matchesStatus;
  });

  const formatTimestamp = (isoString) => {
    try {
      // expecting isoString (UTC) — use browser to present in Asia/Kolkata
      return new Date(isoString).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour12: true,
      });
    } catch {
      return isoString || "—";
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="p-14">
        {/* Header with inline refresh */}
        <div className="mb-8 flex items-start justify-between gap-6">
          <div>
            <h1 className="text-[#E6EDF3] mb-2">Audit Logs</h1>
            <p className="text-[#9BA1A6]">
              Monitor authenticated user activity and unauthorized access
              attempts
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="border-[#30363D] text-[#E6EDF3] hover:bg-[#161B22] flex items-center gap-2"
              onClick={fetchLogs}
              disabled={loading}
            >
              <RotateCcw
                className={`w-4 h-4 transition-transform ${
                  loading ? "animate-spin" : ""
                }`}
              />
              {loading ? "Refreshing…" : "Refresh"}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-[#161B22] border-[#30363D] mb-6 card-glow">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="relative flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-[#9BA1A6] z-10 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search logs by path, method, IP, or user agent..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-base bg-[#0D1117] border-[#30363D] text-[#E6EDF3] placeholder:text-[#9BA1A6]/60 w-full"
                />
              </div>

              <div className="flex items-center">
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger className="h-12 text-base bg-[#0D1117] border-[#30363D] text-[#E6EDF3] w-full">
                    <SelectValue placeholder="Filter by method" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#161B22] border-[#30363D]">
                    <SelectItem value="all" className="text-[#E6EDF3]">
                      All Methods
                    </SelectItem>
                    <SelectItem value="GET" className="text-[#E6EDF3]">
                      GET
                    </SelectItem>
                    <SelectItem value="POST" className="text-[#E6EDF3]">
                      POST
                    </SelectItem>
                    <SelectItem value="PATCH" className="text-[#E6EDF3]">
                      PATCH
                    </SelectItem>
                    <SelectItem value="DELETE" className="text-[#E6EDF3]">
                      DELETE
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-12 text-base bg-[#0D1117] border-[#30363D] text-[#E6EDF3] w-full">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#161B22] border-[#30363D]">
                    <SelectItem value="all" className="text-[#E6EDF3]">
                      All Status
                    </SelectItem>
                    <SelectItem value="success" className="text-[#E6EDF3]">
                      Success
                    </SelectItem>
                    <SelectItem value="error" className="text-[#E6EDF3]">
                      Errors
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card className="bg-[#161B22] border-[#30363D] card-glow">
          <CardHeader>
            <CardTitle className="text-[#E6EDF3]">Activity Log</CardTitle>
            <CardDescription className="text-[#9BA1A6]">
              Showing authenticated actions and unauthorized attempts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && logs.length === 0 ? (
              <p className="text-[#9BA1A6] text-center py-6">
                Loading audit logs...
              </p>
            ) : (
              <div className="border border-[#30363D] rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-[#0D1117]">
                    <TableRow className="border-[#30363D]">
                      <TableHead className="text-[#E6EDF3] h-14">
                        User
                      </TableHead>
                      <TableHead className="text-[#E6EDF3] h-14">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" /> Timestamp
                        </div>
                      </TableHead>
                      <TableHead className="text-[#E6EDF3] h-14">
                        Method
                      </TableHead>
                      <TableHead className="text-[#E6EDF3] h-14">
                        Endpoint
                      </TableHead>
                      <TableHead className="text-[#E6EDF3] h-14">
                        Status
                      </TableHead>
                      <TableHead className="text-[#E6EDF3] h-14">
                        IP Address
                      </TableHead>
                      <TableHead className="text-[#E6EDF3] h-14">
                        User Agent
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.length === 0 ? (
                      <TableRow>
                        <TableCell
                          className="text-[#9BA1A6] py-6 text-center"
                          colSpan={7}
                        >
                          No logs to show
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLogs.map((log, index) => (
                        <TableRow
                          key={log.id}
                          className={`border-[#30363D] hover:bg-[#0D1117] ${
                            index % 2 === 1 ? "bg-[#0D1117]/30" : ""
                          }`}
                        >
                          <TableCell className="text-[#E6EDF3]">
                            {log.user?.username ? (
                              <>
                                {log.user.username}{" "}
                                <span className="text-[#9BA1A6] text-sm">
                                  ({log.user.role})
                                </span>
                              </>
                            ) : (
                              <span className="text-[#FF5252]">
                                Unauthorized
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-[#9BA1A6]">
                            {formatTimestamp(log.timestamp)}
                          </TableCell>
                          <TableCell className="text-[#E6EDF3] font-mono">
                            <div className="flex items-center gap-2">
                              {getActionIcon(log.method)}
                              {log.method}
                            </div>
                          </TableCell>
                          <TableCell className="text-[#E6EDF3] truncate max-w-[300px]">
                            {log.path}
                          </TableCell>
                          <TableCell className="h-16">
                            <Badge className={getStatusColor(log.status_code)}>
                              {log.status_code}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-[#E6EDF3]">
                            {log.ip_address || "—"}
                          </TableCell>
                          <TableCell className="text-[#9BA1A6] text-sm truncate max-w-[250px]">
                            {log.user_agent || "—"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
