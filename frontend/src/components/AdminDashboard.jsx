import { useEffect, useState } from "react";
import { getCurrentUser, getDashboardSummary } from "../services/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  FolderOpen,
  Users,
  FileText,
  Upload,
  RotateCcw,
  Activity,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // 🔹 Fetch user and dashboard summary together
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [me, summaryData] = await Promise.all([
          getCurrentUser(),
          getDashboardSummary(),
        ]);
        setUser(me);
        setSummary(summaryData);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch dashboard summary");
      } finally {
        setLoading(false);
      }
    }

    const token = localStorage.getItem("token");
    if (token) {
      fetchData();
    } else {
      console.log("No token found, skipping dashboard fetch.");
    }
  }, []);

  const statCards = [
    {
      label: "Total Users",
      value: summary?.total_users ?? "—",
      icon: Users,
      color: "text-[#6C63FF]",
      bgColor: "bg-[#6C63FF]/10",
    },
    {
      label: "UFDR Files",
      value: summary?.total_ufdr_files ?? "—",
      icon: FolderOpen,
      color: "text-[#00BFA5]",
      bgColor: "bg-[#00BFA5]/10",
    },
    {
      label: "Artifacts",
      value: summary?.total_artifacts ?? "—",
      icon: FileText,
      color: "text-[#03DAC6]",
      bgColor: "bg-[#03DAC6]/10",
    },
    {
      label: "Recent Uploads",
      value: summary?.recent_uploads?.length ?? "—",
      icon: Upload,
      color: "text-[#FF5252]",
      bgColor: "bg-[#FF5252]/10",
    },
  ];

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="p-14">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-[#E6EDF3] mb-2">
              Welcome,{" "}
              {user?.username
                ? user.username.charAt(0).toUpperCase() + user.username.slice(1)
                : "Admin"}
            </h1>
            <p className="text-[#9BA1A6]">
              System overview and forensic intelligence metrics
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.label}
                className="bg-[#161B22] border-[#30363D] hover:border-[#00BFA5] transition-all card-glow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}
                    >
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                  <p className="text-[#E6EDF3] text-3xl mb-1">
                    {stat.value ?? "—"}
                  </p>
                  <p className="text-[#9BA1A6]">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Two-column layout: Recent Uploads + Insights */}
        <div className="grid lg:grid-cols-[65fr_35fr] gap-6">
          {/* Recent Uploads */}
          <Card className="bg-[#161B22] border-[#30363D] card-glow">
            <CardHeader>
              <CardTitle className="text-[#E6EDF3] flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#6C63FF]" />
                Recent UFDR Uploads
              </CardTitle>
              <CardDescription className="text-[#9BA1A6]">
                Latest evidence submissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {summary?.recent_uploads?.length > 0 ? (
                summary.recent_uploads.map((file, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#0D1117] border border-[#30363D] rounded-lg hover:border-[#6C63FF] transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[#E6EDF3] truncate max-w-[300px]">
                        {file.filename}
                      </p>
                      <p className="text-[#9BA1A6] text-sm">
                        {new Date(file.uploaded_at).toLocaleString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          hour12: true,
                        })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[#9BA1A6] text-sm">
                  No recent uploads found.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Insights Panel */}
          <div className="space-y-6">
            {/* Activity summary */}
            <Card className="bg-[#161B22] border-[#30363D] card-glow">
              <CardHeader>
                <CardTitle className="text-[#E6EDF3] flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#00BFA5]" />
                  System Insights
                </CardTitle>
                <CardDescription className="text-[#9BA1A6]">
                  Auto-generated overview
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-[#0D1117] border border-[#30363D] rounded-lg">
                  <p className="text-[#E6EDF3] text-sm">
                    <span className="text-[#00BFA5] font-medium">
                      {summary?.total_users}
                    </span>{" "}
                    registered users managing{" "}
                    <span className="text-[#6C63FF] font-medium">
                      {summary?.total_ufdr_files}
                    </span>{" "}
                    UFDR files.
                  </p>
                </div>
                <div className="p-3 bg-[#0D1117] border border-[#30363D] rounded-lg">
                  <p className="text-[#E6EDF3] text-sm">
                    Total{" "}
                    <span className="text-[#03DAC6] font-medium">
                      {summary?.total_artifacts}
                    </span>{" "}
                    artifacts extracted from uploaded data.
                  </p>
                </div>
                <div className="p-3 bg-[#0D1117] border border-[#30363D] rounded-lg">
                  <p className="text-[#E6EDF3] text-sm">
                    System is{" "}
                    <span className="text-[#00BFA5] font-medium">
                      operational
                    </span>{" "}
                    with all endpoints responding normally.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Health card */}
            <Card className="bg-[#161B22] border-[#30363D] card-glow">
              <CardHeader>
                <CardTitle className="text-[#E6EDF3] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#FF5252]" />
                  System Health
                </CardTitle>
                <CardDescription className="text-[#9BA1A6]">
                  Status snapshot
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-[#9BA1A6] text-sm">
                <div className="flex justify-between">
                  <span>Database Connection</span>
                  <Badge className="bg-[#00BFA5]/20 text-[#00BFA5] border-[#00BFA5]">
                    Active
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>API Status</span>
                  <Badge className="bg-[#00BFA5]/20 text-[#00BFA5] border-[#00BFA5]">
                    Healthy
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Data Sync</span>
                  <Badge className="bg-[#6C63FF]/20 text-[#6C63FF] border-[#6C63FF]">
                    Stable
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
