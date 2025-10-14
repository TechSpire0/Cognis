import { useState, useEffect } from "react";
import { getCases, getDashboardSummary, getCurrentUser } from "../services/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import {
  FolderOpen,
  Clock,
  FileText,
  ChevronRight,
  Upload,
  Activity,
  Calendar,
  User,
  CheckCircle2,
} from "lucide-react";

export function Dashboard() {
  const [summaryData, setSummaryData] = useState([]);
  const [activeCases, setActiveCases] = useState([]);
  const [recentUploads, setRecentUploads] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const [me, myCases, dashboard] = await Promise.all([
          getCurrentUser(),
          getCases(),
          getDashboardSummary(),
        ]);

        setUser(me); // ✅ fixed

        // 🔹 Summary cards (real data)
        const totalCases = myCases.length;
        const totalUFDRs = dashboard?.total_ufdr_files || 0;
        const totalArtifacts = dashboard?.total_artifacts || 0;
        const recentCount = dashboard?.recent_uploads?.length || 0;

        setSummaryData([
          {
            label: "Assigned Cases",
            count: totalCases,
            icon: FolderOpen,
            color: "text-[#00BFA5]",
            bgColor: "bg-[#00BFA5]/10",
          },
          {
            label: "UFDR Files",
            count: totalUFDRs,
            icon: Upload,
            color: "text-[#6C63FF]",
            bgColor: "bg-[#6C63FF]/10",
          },
          {
            label: "Total Artifacts",
            count: totalArtifacts,
            icon: FileText,
            color: "text-[#03DAC6]",
            bgColor: "bg-[#03DAC6]/10",
          },
          {
            label: "Recent Uploads",
            count: recentCount,
            icon: Activity,
            color: "text-[#9BA1A6]",
            bgColor: "bg-[#161B22]",
          },
        ]);

        // 🔹 Assigned cases (investigator-only)
        setActiveCases(
          myCases.map((c) => ({
            caseId: c.id,
            caseName: c.title || "Untitled Case",
            description: c.description || "No description available.",
            assignedDate: c.created_at
              ? new Date(c.created_at).toLocaleDateString("en-IN")
              : "—",
            investigator: me.username,
            artifactsCount: c.artifact_count || 0,
          }))
        );

        // 🔹 Recent uploads
        setRecentUploads(dashboard?.recent_uploads || []);
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleCaseClick = (caseItem) => {
    setSelectedCase(caseItem);
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-[#9BA1A6]">
        Loading dashboard...
      </div>
    );
  }

  const getStatusBadge = (status) =>
    "bg-[#00BFA5]/20 text-[#00BFA5] border-[#00BFA5]";

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="p-14">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[#E6EDF3] mb-2">
            Welcome,{" "}
            {user?.username
              ? user.username.charAt(0).toUpperCase() + user.username.slice(1)
              : "Investigator"}
          </h1>
          <p className="text-[#9BA1A6]">
            Your digital forensic workspace powered by AI intelligence
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {summaryData.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.label}
                className="bg-[#161B22] border-[#30363D] hover:border-[#00BFA5] transition-all card-glow"
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-lg ${item.bgColor} flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <div>
                      <p className="text-[#9BA1A6] text-sm mb-1">
                        {item.label}
                      </p>
                      <p className="text-[#E6EDF3] text-2xl">{item.count}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Cases + Recent Uploads */}
        <div className="grid lg:grid-cols-[70fr_30fr] gap-6">
          {/* Assigned Cases */}
          <div className="space-y-6">
            <Card className="bg-[#161B22] border-[#30363D] card-glow">
              <CardHeader>
                <CardTitle className="text-[#E6EDF3] flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-[#00BFA5]" />
                  Cases Assigned to You
                </CardTitle>
                <CardDescription className="text-[#9BA1A6]">
                  Your current case workload
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeCases.length === 0 ? (
                  <p className="text-[#9BA1A6] text-sm text-center py-4">
                    No cases assigned yet.
                  </p>
                ) : (
                  activeCases.map((caseItem) => (
                    <div
                      key={caseItem.caseId}
                      onClick={() => handleCaseClick(caseItem)}
                      className="p-4 bg-[#0D1117] border border-[#30363D] rounded-lg hover:border-[#00BFA5] transition-all cursor-pointer group glow-hover"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="text-[#00BFA5]">{caseItem.caseId}</p>
                          </div>
                          <p className="text-[#E6EDF3] mb-1">
                            {caseItem.caseName}
                          </p>
                          <p className="text-[#9BA1A6] text-sm">
                            {caseItem.description}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[#9BA1A6] group-hover:text-[#00BFA5] transition-colors flex-shrink-0 ml-4" />
                      </div>
                      <div className="flex items-center gap-4 pt-3 border-t border-[#30363D]">
                        <Badge className={getStatusBadge("Active")}>
                          Active
                        </Badge>
                        <span className="text-[#9BA1A6] text-xs flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Assigned: {caseItem.assignedDate}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent UFDR Uploads */}
          <div className="space-y-6">
            <Card className="bg-[#161B22] border-[#30363D] card-glow">
              <CardHeader>
                <CardTitle className="text-[#E6EDF3] flex items-center gap-2">
                  <Upload className="w-5 h-5 text-[#6C63FF]" />
                  Recent UFDR Uploads
                </CardTitle>
                <CardDescription className="text-[#9BA1A6]">
                  Latest forensic data files uploaded to the system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentUploads.length === 0 ? (
                  <p className="text-[#9BA1A6] text-sm text-center py-4">
                    No recent uploads found.
                  </p>
                ) : (
                  recentUploads.map((upload, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#0D1117] border border-[#30363D] rounded-lg hover:border-[#6C63FF] transition-all"
                    >
                      <p className="text-[#E6EDF3] text-sm mb-1">
                        {upload.filename}
                      </p>
                      <p className="text-[#9BA1A6] text-xs">
                        {new Date(upload.uploaded_at).toLocaleString("en-IN")}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* ✅ Original Rich Case Details Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#161B22] border-[#30363D] text-[#E6EDF3] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#E6EDF3] text-2xl">
              Case Details
            </DialogTitle>
          </DialogHeader>

          {selectedCase && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[#30363D]">
                <div className="flex items-center gap-2 mb-2">
                  <FolderOpen className="w-5 h-5 text-[#00BFA5]" />
                  <h3 className="text-[#E6EDF3] text-xl">
                    Case #{selectedCase.caseId}
                  </h3>
                </div>
                <p className="text-[#9BA1A6]">{selectedCase.caseName}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#0D1117] border border-[#30363D] rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-5 h-5 text-[#00BFA5]" />
                    <p className="text-[#9BA1A6] text-sm">Investigator</p>
                  </div>
                  <p className="text-[#E6EDF3]">{selectedCase.investigator}</p>
                </div>

                <div className="p-4 bg-[#0D1117] border border-[#30363D] rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-[#6C63FF]" />
                    <p className="text-[#9BA1A6] text-sm">Assigned Date</p>
                  </div>
                  <p className="text-[#E6EDF3]">{selectedCase.assignedDate}</p>
                </div>

                <div className="p-4 bg-[#0D1117] border border-[#30363D] rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-[#03DAC6]" />
                    <p className="text-[#9BA1A6] text-sm">Status</p>
                  </div>
                  <Badge className={getStatusBadge("Active")}>Active</Badge>
                </div>
              </div>

              <div className="p-4 bg-[#0D1117] border border-[#30363D] rounded-lg">
                <p className="text-[#9BA1A6] text-sm mb-2">Description</p>
                <p className="text-[#E6EDF3]">{selectedCase.description}</p>
              </div>

              <div className="pt-4 border-t border-[#30363D]">
                <Button
                  onClick={() => setIsDialogOpen(false)}
                  className="w-full bg-[#00BFA5] text-[#0D1117] hover:bg-[#03DAC6]"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
