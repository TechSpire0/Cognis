import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  FolderOpen,
  Users,
  FolderX,
  UserCheck,
  Activity,
  UserPlus,
  FolderPlus,
  FileText,
  Upload
} from "lucide-react";

export function AdminDashboard({ onNavigate }) {
  const assignedCases = 39;

  const stats = [
    { label: "Total Cases", value: "47", icon: FolderOpen, color: "text-[#00BFA5]", change: "+12%", bgColor: "bg-[#00BFA5]/10" },
    { label: "Active Investigators", value: "12", icon: Users, color: "text-[#6C63FF]", change: "+3", bgColor: "bg-[#6C63FF]/10" },
    { label: "Unassigned Cases", value: "8", icon: FolderX, color: "text-[#FF5252]", change: "-2", bgColor: "bg-[#FF5252]/10" },
    { label: "Assigned Cases", value: assignedCases.toString(), icon: UserCheck, color: "text-[#03DAC6]", change: "+7", bgColor: "bg-[#03DAC6]/10" },
  ];

  const investigators = [
    { name: "Sarah Miller", cases: 8, completed: 5, active: 3, efficiency: 92 },
    { name: "James Wilson", cases: 6, completed: 4, active: 2, efficiency: 88 },
    { name: "Emily Chen", cases: 7, completed: 6, active: 1, efficiency: 95 },
    { name: "Michael Roberts", cases: 5, completed: 3, active: 2, efficiency: 85 },
    { name: "David Anderson", cases: 9, completed: 7, active: 2, efficiency: 90 },
  ];

  const recentActivity = [
    { id: 1, investigator: "Sarah Miller", action: "uploaded new UFDR file for", case: "Case #2025-047", time: "5 min ago" },
    { id: 2, investigator: "James Wilson", action: "completed analysis on", case: "Case #2025-044", time: "23 min ago" },
    { id: 3, investigator: "Emily Chen", action: "generated report for", case: "Case #2025-041", time: "1 hour ago" },
    { id: 4, investigator: "Sarah Miller", action: "initiated AI chat for", case: "Case #2025-047", time: "2 hours ago" },
  ];

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="p-14">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[#E6EDF3] mb-2">Admin Dashboard</h1>
          <p className="text-[#9BA1A6]">Overview of cases, investigators, and system activity</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="bg-[#161B22] border-[#30363D] hover:border-[#00BFA5] transition-all group card-glow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <Badge className="bg-[#00BFA5]/20 text-[#00BFA5] border-[#00BFA5]">
                      {stat.change}
                    </Badge>
                  </div>
                  <p className="text-[#E6EDF3] text-3xl mb-1">{stat.value}</p>
                  <p className="text-[#9BA1A6]">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Layout: 70/30 Split */}
        <div className="grid lg:grid-cols-[70fr_30fr] gap-6">
          {/* Main Column (70%) */}
          <div className="space-y-6">
            {/* Investigator Workload */}
            <Card className="bg-[#161B22] border-[#30363D] card-glow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[#E6EDF3] flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-[#00BFA5]" />
                      Investigator Workload
                    </CardTitle>
                    <CardDescription className="text-[#9BA1A6]">
                      Current case distribution and completion rates
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {investigators.map((investigator) => (
                  <div
                    key={investigator.name}
                    className="p-4 bg-[#0D1117] border border-[#30363D] rounded-lg hover:border-[#00BFA5] transition-all glow-hover"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-[#E6EDF3]">{investigator.name}</h4>
                          <Badge className="bg-[#00BFA5]/20 text-[#00BFA5] border-[#00BFA5] text-xs">
                            {investigator.efficiency}% efficiency
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-[#9BA1A6]">
                          <span className="flex items-center gap-1">
                            <FolderOpen className="w-3 h-3" />
                            {investigator.cases} total
                          </span>
                          <span>•</span>
                          <span className="text-[#00BFA5]">{investigator.completed} completed</span>
                          <span>•</span>
                          <span className="text-[#6C63FF]">{investigator.active} active</span>
                        </div>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-[#30363D] rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#00BFA5] h-full rounded-full transition-all"
                        style={{ width: `${(investigator.completed / investigator.cases) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Column (30%) */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card className="bg-[#161B22] border-[#30363D] card-glow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[#E6EDF3] flex items-center gap-2">
                      <Activity className="w-5 h-5 text-[#6C63FF]" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription className="text-[#9BA1A6]">
                      Latest actions
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="p-3 bg-[#0D1117] border border-[#30363D] rounded-lg hover:border-[#6C63FF] transition-all glow-hover"
                  >
                    <p className="text-[#E6EDF3] text-sm mb-1">
                      <span className="text-[#9BA1A6]">{activity.investigator}</span> {activity.action}
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
    </div>
  );
}
