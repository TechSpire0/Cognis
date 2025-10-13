//src/components/Dashboard.jsx

import { useState } from "react";
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
  Phone,
  MessageSquare,
  Image,
  Bitcoin,
  FileText,
  ListChecks,
  FolderOpen,
  Clock,
  CheckCircle2,
  User,
  Calendar,
  ChevronRight,
  Upload,
  MessageCircle,
  FileBarChart,
  Activity,
  Search,
} from "lucide-react";

export function Dashboard({ onNavigate }) {
  const [selectedCase, setSelectedCase] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const summaryData = [
    {
      label: "Total Cases",
      count: 47,
      icon: FolderOpen,
      color: "text-[#00BFA5]",
      bgColor: "bg-[#00BFA5]/10",
    },
    {
      label: "Open Cases",
      count: 12,
      icon: Clock,
      color: "text-[#6C63FF]",
      bgColor: "bg-[#6C63FF]/10",
    },
    {
      label: "Closed Cases",
      count: 32,
      icon: CheckCircle2,
      color: "text-[#03DAC6]",
      bgColor: "bg-[#03DAC6]/10",
    },
    {
      label: "Pending Artifacts",
      count: 18,
      icon: FileText,
      color: "text-[#9BA1A6]",
      bgColor: "bg-[#161B22]",
    },
  ];

  const activeCases = [
    {
      caseId: "2025-047",
      caseName: "Operation Thunder",
      status: "Active",
      lastUpdated: "2 hours ago",
      investigator: "Agent Sarah Miller",
      dateOpened: "2025-10-01",
      priority: "High",
      description:
        "Investigation into organized cybercrime network operating across multiple jurisdictions.",
      artifactsCount: 15,
    },
    {
      caseId: "2025-046",
      caseName: "Crypto Investigation",
      status: "Under Review",
      lastUpdated: "5 hours ago",
      investigator: "Agent Sarah Miller",
      dateOpened: "2025-09-28",
      priority: "Medium",
      description:
        "Tracking cryptocurrency transactions related to money laundering activities.",
      artifactsCount: 8,
    },
    {
      caseId: "2025-045",
      caseName: "Border Surveillance",
      status: "Active",
      lastUpdated: "1 day ago",
      investigator: "Agent Sarah Miller",
      dateOpened: "2025-09-25",
      priority: "High",
      description:
        "Monitoring cross-border communications and suspicious border crossing patterns.",
      artifactsCount: 12,
    },
    {
      caseId: "2025-044",
      caseName: "Data Breach Analysis",
      status: "Pending",
      lastUpdated: "2 days ago",
      investigator: "Agent Sarah Miller",
      dateOpened: "2025-09-20",
      priority: "Low",
      description:
        "Analyzing compromised data from recent corporate security breach.",
      artifactsCount: 6,
    },
    {
      caseId: "2025-043",
      caseName: "Financial Fraud Case",
      status: "Active",
      lastUpdated: "3 days ago",
      investigator: "Agent Sarah Miller",
      dateOpened: "2025-09-18",
      priority: "Medium",
      description:
        "Investigation into large-scale financial fraud scheme targeting elderly victims.",
      artifactsCount: 9,
    },
  ];

  const recentActivity = [
    {
      id: 1,
      action: "Uploaded UFDR file for",
      case: "Case #2025-047",
      time: "5 min ago",
    },
    {
      id: 2,
      action: "Completed analysis on",
      case: "Case #2025-044",
      time: "23 min ago",
    },
    {
      id: 3,
      action: "Generated report for",
      case: "Case #2025-041",
      time: "1 hour ago",
    },
    {
      id: 4,
      action: "Initiated AI chat for",
      case: "Case #2025-047",
      time: "2 hours ago",
    },
  ];

  const getStatusBadge = (status) => {
    const statusColors = {
      Active: "bg-[#00BFA5]/20 text-[#00BFA5] border-[#00BFA5]",
      "Under Review": "bg-[#6C63FF]/20 text-[#6C63FF] border-[#6C63FF]",
      Pending: "bg-[#9BA1A6]/20 text-[#9BA1A6] border-[#9BA1A6]",
      Closed: "bg-[#03DAC6]/20 text-[#03DAC6] border-[#03DAC6]",
    };
    return (
      statusColors[status] || "bg-[#9BA1A6]/20 text-[#9BA1A6] border-[#9BA1A6]"
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityColors = {
      High: "bg-[#FF5252]/20 text-[#FF5252] border-[#FF5252]",
      Medium: "bg-[#6C63FF]/20 text-[#6C63FF] border-[#6C63FF]",
      Low: "bg-[#9BA1A6]/20 text-[#9BA1A6] border-[#9BA1A6]",
    };
    return (
      priorityColors[priority] ||
      "bg-[#9BA1A6]/20 text-[#9BA1A6] border-[#9BA1A6]"
    );
  };

  const handleCaseClick = (caseItem) => {
    setSelectedCase(caseItem);
    setIsDialogOpen(true);
  };

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="p-14">
        <div className="mb-8">
          <h1 className="text-[#E6EDF3] mb-2">Investigator Dashboard</h1>
          <p className="text-[#9BA1A6]">
            AI-powered analysis and quick access to case evidence
          </p>
        </div>

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

        <div className="grid lg:grid-cols-[70fr_30fr] gap-6">
          <div className="space-y-6">
            <Card className="bg-[#161B22] border-[#30363D] card-glow">
              <CardHeader>
                <CardTitle className="text-[#E6EDF3] flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-[#00BFA5]" />
                  Cases Assigned to You
                </CardTitle>
                <CardDescription className="text-[#9BA1A6]">
                  Your active case workload
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeCases.map((caseItem) => (
                  <div
                    key={caseItem.caseId}
                    onClick={() => handleCaseClick(caseItem)}
                    className="p-4 bg-[#0D1117] border border-[#30363D] rounded-lg hover:border-[#00BFA5] transition-all cursor-pointer group glow-hover"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="text-[#00BFA5]">{caseItem.caseId}</p>
                          <Badge
                            className={getPriorityBadge(caseItem.priority)}
                          >
                            {caseItem.priority}
                          </Badge>
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
                      <Badge className={getStatusBadge(caseItem.status)}>
                        {caseItem.status}
                      </Badge>
                      <span className="text-[#9BA1A6] text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {caseItem.lastUpdated}
                      </span>
                      <span className="text-[#9BA1A6] text-xs flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {caseItem.artifactsCount} artifacts
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-[#161B22] border-[#30363D] card-glow">
              <CardHeader>
                <CardTitle className="text-[#E6EDF3] flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#6C63FF]" />
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-[#9BA1A6]">
                  Your latest actions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="p-3 bg-[#0D1117] border border-[#30363D] rounded-lg hover:border-[#6C63FF] transition-all glow-hover"
                  >
                    <p className="text-[#E6EDF3] text-sm mb-1">
                      {activity.action}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-[#00BFA5] text-xs">{activity.case}</p>
                      <p className="text-[#9BA1A6] text-xs">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

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
                    <p className="text-[#9BA1A6] text-sm">Date Opened</p>
                  </div>
                  <p className="text-[#E6EDF3]">{selectedCase.dateOpened}</p>
                </div>

                <div className="p-4 bg-[#0D1117] border border-[#30363D] rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-[#03DAC6]" />
                    <p className="text-[#9BA1A6] text-sm">Status</p>
                  </div>
                  <Badge className={getStatusBadge(selectedCase.status)}>
                    {selectedCase.status}
                  </Badge>
                </div>

                <div className="p-4 bg-[#0D1117] border border-[#30363D] rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-5 h-5 text-[#9BA1A6]" />
                    <p className="text-[#9BA1A6] text-sm">Priority</p>
                  </div>
                  <Badge className={getPriorityBadge(selectedCase.priority)}>
                    {selectedCase.priority}
                  </Badge>
                </div>
              </div>

              <div className="p-4 bg-[#0D1117] border border-[#30363D] rounded-lg">
                <p className="text-[#9BA1A6] text-sm mb-2">Description</p>
                <p className="text-[#E6EDF3]">{selectedCase.description}</p>
              </div>

              <div className="p-4 bg-[#0D1117] border border-[#30363D] rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#00BFA5]" />
                  <div>
                    <p className="text-[#9BA1A6] text-sm">Total Artifacts</p>
                    <p className="text-[#E6EDF3] text-xl">
                      {selectedCase.artifactsCount}
                    </p>
                  </div>
                </div>
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
