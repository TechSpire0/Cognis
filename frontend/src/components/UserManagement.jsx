import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Search, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { toast } from "sonner";
import { getAllUsers, getCaseAssignments } from "../services/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { createUser } from "../services/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

export function UserManagement() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch all users and their active case counts
  useEffect(() => {
    async function loadUsers() {
      try {
        const [usersData, assignments] = await Promise.all([
          getAllUsers(),
          getCaseAssignments(),
        ]);

        const caseCountMap = {};
        assignments.forEach((a) => {
          caseCountMap[a.investigator_id] =
            (caseCountMap[a.investigator_id] || 0) + 1;
        });

        const merged = usersData.map((u) => ({
          ...u,
          active_cases: caseCountMap[u.id] || 0,
        }));

        setUsers(merged);
      } catch (err) {
        toast.error("Failed to load users.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="p-14">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-[#E6EDF3] mb-2">User Management</h1>
            <p className="text-[#9BA1A6]">
              Manage investigator and admin accounts
            </p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-[#00BFA5] text-[#0D1117] hover:bg-[#03DAC6]">
                <UserPlus className="w-4 h-4 mr-2" />
                Add New User
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#161B22] border-[#30363D] text-[#E6EDF3]">
              <DialogHeader>
                <DialogTitle className="text-[#E6EDF3]">
                  Create New User
                </DialogTitle>
                <DialogDescription className="text-[#9BA1A6]">
                  Add a new investigator or admin account
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <CreateUserForm
                  onUserCreated={(user) =>
                    setUsers((prev) => [...prev, { ...user, active_cases: 0 }])
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
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base bg-[#0D1117] border-[#30363D] text-[#E6EDF3] placeholder:text-[#9BA1A6]/60"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-[#161B22] border-[#30363D] card-glow">
          <CardHeader>
            <CardTitle className="text-[#E6EDF3]">
              All Users ({filteredUsers.length})
            </CardTitle>
            <CardDescription className="text-[#9BA1A6]">
              Overview of all registered users and active case counts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border border-[#30363D] rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-[#0D1117]">
                  <TableRow className="border-[#30363D] hover:bg-[#0D1117]">
                    <TableHead className="text-[#E6EDF3] h-14 text-base">
                      User
                    </TableHead>
                    <TableHead className="text-[#E6EDF3] h-14 text-base">
                      Email
                    </TableHead>
                    <TableHead className="text-[#E6EDF3] h-14 text-base">
                      Role
                    </TableHead>
                    <TableHead className="text-[#E6EDF3] h-14 text-base">
                      Active Cases
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-[#9BA1A6] py-6"
                      >
                        Loading users...
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-[#9BA1A6] py-6"
                      >
                        No users found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user, index) => (
                      <TableRow
                        key={user.id}
                        className={`border-[#30363D] hover:bg-[#0D1117] transition-colors ${
                          index % 2 === 1 ? "bg-[#0D1117]/30" : ""
                        }`}
                      >
                        <TableCell className="h-16">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-9 h-9 bg-[#00BFA5]/10 border border-[#00BFA5]">
                              <AvatarFallback className="text-[#00BFA5]">
                                {getInitials(user.username)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-[#E6EDF3] text-base">
                              {user.username}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="text-[#9BA1A6] h-16 text-base">
                          {user.email}
                        </TableCell>

                        <TableCell className="h-16">
                          <Badge
                            className={`${
                              user.role === "admin"
                                ? "bg-[#6C63FF]/20 text-[#6C63FF] border-[#6C63FF]"
                                : "bg-[#03DAC6]/20 text-[#03DAC6] border-[#03DAC6]"
                            }`}
                          >
                            {user.role === "admin" ? "Admin" : "Investigator"}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-[#E6EDF3] h-16 text-center text-base">
                          {user.active_cases}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// 🧩 SUBCOMPONENT: CreateUserForm (Dialog Form)
// ---------------------------------------------------------
function CreateUserForm({ onUserCreated }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    role: "investigator",
    temp_password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await createUser(form);
      toast.success("User created successfully.");
      if (onUserCreated) onUserCreated(user);
      setForm({
        username: "",
        email: "",
        role: "investigator",
        temp_password: "",
      });
    } catch (err) {
      toast.error(err.message || "Failed to create user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-[#E6EDF3]">Username</Label>
        <Input
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          placeholder="Enter username"
          required
          className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3]"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-[#E6EDF3]">Email</Label>
        <Input
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="email@agency.gov"
          required
          className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3]"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-[#E6EDF3]">Role</Label>
        <Select
          value={form.role}
          onValueChange={(v) => setForm({ ...form, role: v })}
        >
          <SelectTrigger className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3]">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent className="bg-[#161B22] border-[#30363D]">
            <SelectItem value="investigator" className="text-[#E6EDF3]">
              Investigator
            </SelectItem>
            <SelectItem value="admin" className="text-[#E6EDF3]">
              Admin
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-[#E6EDF3]">Temporary Password</Label>
        <Input
          value={form.temp_password}
          onChange={(e) => setForm({ ...form, temp_password: e.target.value })}
          placeholder="e.g. Temp@123"
          required
          className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3]"
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-[#00BFA5] text-[#0D1117] hover:bg-[#03DAC6]"
      >
        {loading ? "Creating..." : "Create User"}
      </Button>
    </form>
  );
}
