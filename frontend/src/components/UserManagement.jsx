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
import { UserPlus, Search, Shield, Trash2, Edit, Lock, AlertTriangle, MoreVertical, Eye } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { toast } from "sonner";

export function UserManagement() {
  const [users, setUsers] = useState([
    { id: 1, name: "John Doe", email: "john.doe@agency.gov", role: "Investigator", badge: "NIA-001", status: "Active", cases: 8 },
    { id: 2, name: "Jane Smith", email: "jane.smith@agency.gov", role: "Investigator", badge: "NIA-002", status: "Active", cases: 6 },
    { id: 3, name: "Mike Johnson", email: "mike.j@agency.gov", role: "Investigator", badge: "NIA-003", status: "Active", cases: 10 },
    { id: 4, name: "Sarah Williams", email: "s.williams@agency.gov", role: "Investigator", badge: "NIA-004", status: "Active", cases: 5 },
    { id: 5, name: "Robert Brown", email: "r.brown@agency.gov", role: "Investigator", badge: "NIA-005", status: "Suspended", cases: 0 },
    { id: 6, name: "Admin User", email: "admin@agency.gov", role: "Admin", badge: "NIA-ADMIN", status: "Active", cases: 0 },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-[#00BFA5]/20 text-[#00BFA5] border-[#00BFA5]";
      case "Suspended":
        return "bg-[#FF5252]/20 text-[#FF5252] border-[#FF5252]";
      default:
        return "bg-[#9BA1A6]/20 text-[#9BA1A6] border-[#9BA1A6]";
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "Admin":
        return "bg-[#6C63FF]/20 text-[#6C63FF] border-[#6C63FF]";
      case "Investigator":
        return "bg-[#03DAC6]/20 text-[#03DAC6] border-[#03DAC6]";
      default:
        return "bg-[#9BA1A6]/20 text-[#9BA1A6] border-[#9BA1A6]";
    }
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      setUsers(users.filter(u => u.id !== userToDelete.id));
      toast.success(`User ${userToDelete.name} has been deleted`);
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.badge.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="p-14">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-[#E6EDF3] mb-2">User Management</h1>
            <p className="text-[#9BA1A6]">Manage investigator accounts and permissions</p>
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
                <DialogTitle className="text-[#E6EDF3]">Create New User</DialogTitle>
                <DialogDescription className="text-[#9BA1A6]">
                  Add a new investigator or admin account
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-[#E6EDF3]">Full Name</Label>
                  <Input placeholder="Enter full name" className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3]" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#E6EDF3]">Email</Label>
                  <Input placeholder="email@agency.gov" className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3]" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#E6EDF3]">Role</Label>
                  <Select>
                    <SelectTrigger className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3]">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#161B22] border-[#30363D]">
                      <SelectItem value="investigator" className="text-[#E6EDF3]">Investigator</SelectItem>
                      <SelectItem value="admin" className="text-[#E6EDF3]">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full bg-[#00BFA5] text-[#0D1117] hover:bg-[#03DAC6]">
                  Create User
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
                placeholder="Search users by name, email, or badge..."
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
            <CardTitle className="text-[#E6EDF3]">All Users ({filteredUsers.length})</CardTitle>
            <CardDescription className="text-[#9BA1A6]">Manage investigator and admin accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border border-[#30363D] rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-[#0D1117]">
                  <TableRow className="border-[#30363D] hover:bg-[#0D1117]">
                    <TableHead className="text-[#E6EDF3] h-14 text-base">User</TableHead>
                    <TableHead className="text-[#E6EDF3] h-14 text-base">Email</TableHead>
                    <TableHead className="text-[#E6EDF3] h-14 text-base">Badge</TableHead>
                    <TableHead className="text-[#E6EDF3] h-14 text-base">Role</TableHead>
                    <TableHead className="text-[#E6EDF3] h-14 text-base">Status</TableHead>
                    <TableHead className="text-[#E6EDF3] h-14 text-base">Active Cases</TableHead>
                    <TableHead className="text-[#E6EDF3]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user, index) => (
                    <TableRow 
                      key={user.id} 
                      className={`border-[#30363D] hover:bg-[#0D1117] transition-colors ${index % 2 === 1 ? 'bg-[#0D1117]/30' : ''}`}
                    >
                      <TableCell className="h-16">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-9 h-9 bg-[#00BFA5]/10 border border-[#00BFA5]">
                            <AvatarFallback className="text-[#00BFA5]">{getInitials(user.name)}</AvatarFallback>
                          </Avatar>
                          <span className="text-[#E6EDF3] text-base">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[#9BA1A6] h-16 text-base">{user.email}</TableCell>
                      <TableCell className="text-[#E6EDF3] h-16 text-base">{user.badge}</TableCell>
                      <TableCell className="h-16">
                        <Badge className={getRoleColor(user.role)}>
                          {user.role === "Admin" && <Shield className="w-3 h-3 mr-1" />}
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="h-16">
                        <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                      </TableCell>
                      <TableCell className="text-[#9BA1A6] h-16 text-base">{user.cases}</TableCell>
                      <TableCell className="h-16">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-[#9BA1A6] hover:text-[#E6EDF3] hover:bg-[#161B22]">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#161B22] border-[#30363D]">
                            <DropdownMenuItem className="text-[#E6EDF3] focus:bg-[#00BFA5]/10 focus:text-[#00BFA5]">
                              <Eye className="w-4 h-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditUser(user)} className="text-[#E6EDF3] focus:bg-[#6C63FF]/10 focus:text-[#6C63FF]">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-[#E6EDF3] focus:bg-[#6C63FF]/10 focus:text-[#6C63FF]">
                              <Lock className="w-4 h-4 mr-2" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteUser(user)} className="text-[#E6EDF3] focus:bg-[#FF5252]/10 focus:text-[#FF5252]">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete User
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

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="bg-[#161B22] border-[#30363D] text-[#E6EDF3]">
            <DialogHeader>
              <DialogTitle className="text-[#FF5252] flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Confirm Deletion
              </DialogTitle>
              <DialogDescription className="text-[#9BA1A6]">This action cannot be undone.</DialogDescription>
            </DialogHeader>
            {userToDelete && (
              <div className="space-y-4">
                <p className="text-[#E6EDF3]">
                  Are you sure you want to delete user <span className="text-[#00BFA5]">{userToDelete.name}</span>?
                </p>
                <div className="flex gap-3">
                  <Button onClick={() => setIsDeleteDialogOpen(false)} variant="outline" className="flex-1 border-[#30363D] text-[#9BA1A6] hover:bg-[#161B22] hover:text-[#E6EDF3]">Cancel</Button>
                  <Button onClick={confirmDelete} className="flex-1 bg-[#FF5252] text-[#E6EDF3] hover:bg-[#FF5252]/80">Delete User</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
