import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { FolderPlus, UserPlus, Search, UserX } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "sonner";
import {
  getCases,
  getCaseAssignments,
  getInvestigators,
  createCase,
  assignCase,
  unassignCase,
} from "../services/api";

export function CaseManagement() {
  const [cases, setCases] = useState([]);
  const [investigators, setInvestigators] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // ------------------------------
  // Fetch all cases + assignments
  // ------------------------------
  useEffect(() => {
    async function fetchData() {
      try {
        const [caseList, assignments, invList] = await Promise.all([
          getCases(),
          getCaseAssignments(),
          getInvestigators(),
        ]);

        // merge assignments with case list
        const merged = caseList.map((c) => {
          const match = assignments.find((a) => a.case_id === c.id);
          return match
            ? {
                ...c,
                assigned_to: {
                  id: match.investigator_id,
                  username: match.investigator_name,
                  email: match.investigator_email,
                },
              }
            : c;
        });

        setCases(merged);
        setInvestigators(invList);
      } catch (err) {
        toast.error("Failed to load cases or investigators.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // ------------------------------
  // Filtering and classification
  // ------------------------------
  const filteredCases = cases.filter(
    (c) =>
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const assignedCases = filteredCases.filter((c) => c.assigned_to);
  const unassignedCases = filteredCases.filter((c) => !c.assigned_to);

  // ------------------------------
  // Unassign logic
  // ------------------------------
  const handleUnassign = async (caseId, userId) => {
    try {
      await unassignCase({ case_id: caseId, user_id: userId });
      setCases((prev) =>
        prev.map((c) => (c.id === caseId ? { ...c, assigned_to: null } : c))
      );
      toast.success("User unassigned successfully.");
    } catch (err) {
      toast.error(err.message || "Failed to unassign case.");
    }
  };

  // ------------------------------
  // UI
  // ------------------------------
  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="p-14">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-[#E6EDF3] mb-2">Case Management</h1>
            <p className="text-[#9BA1A6]">
              Manage and assign cases to investigators
            </p>
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
                <DialogTitle className="text-[#E6EDF3]">
                  Create New Case
                </DialogTitle>
                <DialogDescription className="text-[#9BA1A6]">
                  Add a new case to the system
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <CreateCaseForm
                  onCaseCreated={(newCase) =>
                    setCases((prev) => [newCase, ...prev])
                  }
                />
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

        {/* Tabs */}
        <Tabs defaultValue="assigned" className="w-full">
          <TabsList className="bg-[#161B22] border border-[#30363D]">
            <TabsTrigger
              value="assigned"
              className="data-[state=active]:bg-[#00BFA5] data-[state=active]:text-[#0D1117]"
            >
              Assigned Cases ({assignedCases.length})
            </TabsTrigger>
            <TabsTrigger
              value="unassigned"
              className="data-[state=active]:bg-[#00BFA5] data-[state=active]:text-[#0D1117]"
            >
              Unassigned Cases ({unassignedCases.length})
            </TabsTrigger>
          </TabsList>

          {/* Assigned */}
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
                      <TableRow className="border-[#30363D]">
                        <TableHead className="text-[#E6EDF3]">
                          Case ID
                        </TableHead>
                        <TableHead className="text-[#E6EDF3]">Title</TableHead>
                        <TableHead className="text-[#E6EDF3]">
                          Description
                        </TableHead>
                        <TableHead className="text-[#E6EDF3]">
                          Investigator
                        </TableHead>
                        <TableHead className="text-[#E6EDF3]">
                          Created
                        </TableHead>
                        <TableHead className="text-[#E6EDF3]">
                          Created By
                        </TableHead>
                        <TableHead className="text-[#E6EDF3]">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignedCases.map((caseItem) => (
                        <TableRow
                          key={caseItem.id}
                          className="border-[#30363D]"
                        >
                          <TableCell className="text-[#00BFA5]">
                            {caseItem.id}
                          </TableCell>
                          <TableCell className="text-[#E6EDF3]">
                            {caseItem.title}
                          </TableCell>
                          <TableCell className="text-[#9BA1A6] text-sm max-w-[300px] truncate">
                            {caseItem.description || "—"}
                          </TableCell>
                          <TableCell className="text-[#9BA1A6]">
                            {caseItem.assigned_to?.username || "Unknown"}
                          </TableCell>
                          <TableCell className="text-[#9BA1A6]">
                            {caseItem.created_at?.split("T")[0]}
                          </TableCell>
                          <TableCell className="text-[#9BA1A6]">
                            {caseItem.created_by || "—"}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              className="border-[#FF5252] text-[#FF5252] hover:bg-[#FF5252]/10"
                              onClick={() =>
                                handleUnassign(
                                  caseItem.id,
                                  caseItem.assigned_to?.id
                                )
                              }
                            >
                              <UserX className="w-4 h-4 mr-2" /> Unassign
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Unassigned */}
          <TabsContent value="unassigned" className="mt-6">
            <Card className="bg-[#161B22] border-[#30363D] card-glow">
              <CardHeader>
                <CardTitle className="text-[#E6EDF3]">
                  Unassigned Cases
                </CardTitle>
                <CardDescription className="text-[#9BA1A6]">
                  Cases waiting to be assigned to investigators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {unassignedCases.map((caseItem) => (
                  <div
                    key={caseItem.id}
                    className="p-4 bg-[#0D1117] border border-[#30363D] rounded-lg hover:border-[#00BFA5] transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[#00BFA5] mb-1">{caseItem.id}</p>
                        <p className="text-[#E6EDF3] mb-1">{caseItem.title}</p>
                        <p className="text-[#9BA1A6] text-sm mb-1">
                          {caseItem.description || "No description"}
                        </p>
                        <p className="text-[#9BA1A6] text-xs">
                          Created by: {caseItem.created_by || "—"} on{" "}
                          {caseItem.created_at?.split("T")[0]}
                        </p>
                      </div>
                      <AssignButton
                        caseId={caseItem.id}
                        investigators={investigators}
                        onAssigned={(inv) =>
                          setCases((prev) =>
                            prev.map((c) =>
                              c.id === caseItem.id
                                ? { ...c, assigned_to: inv }
                                : c
                            )
                          )
                        }
                      />
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

// -------------------------
// Create Case Form
// -------------------------
function CreateCaseForm({ onCaseCreated }) {
  const [form, setForm] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newCase = await createCase(form);
      toast.success("Case created successfully.");
      if (onCaseCreated) onCaseCreated(newCase);
      setForm({ title: "", description: "" });
    } catch (err) {
      toast.error(err.message || "Failed to create case.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-[#E6EDF3]">Title</Label>
        <Input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Enter case title"
          required
          className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3]"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-[#E6EDF3]">Description</Label>
        <Input
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Optional description"
          className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3]"
        />
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-[#00BFA5] text-[#0D1117] hover:bg-[#03DAC6]"
      >
        {loading ? "Creating..." : "Create Case"}
      </Button>
    </form>
  );
}

// -------------------------
// Assign Button Component
// -------------------------
function AssignButton({ caseId, investigators, onAssigned }) {
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAssign = async () => {
    if (!selected) return toast.error("Select an investigator first.");
    setLoading(true);
    try {
      await assignCase({ case_id: caseId, user_id: selected });
      const inv = investigators.find((i) => i.id === selected);
      onAssigned(inv);
      toast.success("Case assigned successfully.");
    } catch (err) {
      toast.error(err.message || "Failed to assign case.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-3">
      <Select onValueChange={(v) => setSelected(v)}>
        <SelectTrigger className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] w-40">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent className="bg-[#161B22] border-[#30363D]">
          {investigators.map((inv) => (
            <SelectItem key={inv.id} value={inv.id} className="text-[#E6EDF3]">
              {inv.username}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        onClick={handleAssign}
        disabled={loading}
        className="bg-[#00BFA5] text-[#0D1117] hover:bg-[#03DAC6]"
      >
        {loading ? "Assigning..." : <UserPlus className="w-4 h-4" />}
      </Button>
    </div>
  );
}
