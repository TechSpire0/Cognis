import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Mail, Lock, User, Shield } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import cognisLogo from "../assets/Cognis.jpg";

export function AuthPages({ page, onNavigate }) {
  const [role, setRole] = useState("investigator");

  const handleLogin = (e) => {
    e.preventDefault();
    if (role === "admin") {
      onNavigate("admin-dashboard");
    } else {
      onNavigate("dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1117] via-[#161B22] to-[#0D1117] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnptLTEyIDBjMy4zMTQgMCA2IDIuNjg2IDYgNnMtMi42ODYgNi02IDYtNi0yLjY4Ni02LTYgMi42ODYtNiA2LTZ6IiBzdHJva2U9IiMwMEJGQTUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiLz48L2c+PC9zdmc+')] opacity-20"></div>

      <Card className="w-full max-w-md bg-[#161B22] border-[#30363D] backdrop-blur-xl relative z-10 card-glow">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full overflow-hidden glow-primary">
              <img
                src={cognisLogo}
                alt="COGNIS Logo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <CardTitle className="text-[#E6EDF3]">
            {page === "login" && "Secure Login"}
            {page === "signup" && "Create Account"}
            {page === "forgot-password" && "Reset Password"}
          </CardTitle>
          <CardDescription className="text-[#9BA1A6]">
            {page === "login" && "Access the COGNIS UFDR Analysis Platform"}
            {page === "signup" && "Register for investigator access"}
            {page === "forgot-password" && "Reset your account password"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {page === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#E6EDF3]">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-[#9BA1A6]" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    required
                    className="pl-10 bg-[#0D1117] border-[#30363D] text-[#E6EDF3] placeholder:text-[#9BA1A6]/60"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#E6EDF3]">
                Email / Employee ID
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-[#9BA1A6]" />
                <Input
                  id="email"
                  type="text"
                  placeholder="investigator@agency.gov"
                  className="pl-10 bg-[#0D1117] border-[#30363D] text-[#E6EDF3] placeholder:text-[#9BA1A6]/60"
                />
              </div>
            </div>

            {page !== "forgot-password" && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#E6EDF3]">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-[#9BA1A6]" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 bg-[#0D1117] border-[#30363D] text-[#E6EDF3] placeholder:text-[#9BA1A6]/60"
                  />
                </div>
              </div>
            )}

            {page === "login" && (
              <div className="space-y-2">
                <Label htmlFor="role" className="text-[#E6EDF3]">
                  Role
                </Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 w-4 h-4 text-[#9BA1A6] z-10 pointer-events-none" />
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="pl-10 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#161B22] border-[#30363D]">
                      <SelectItem
                        value="investigator"
                        className="text-[#E6EDF3] focus:bg-[#00BFA5]/10 focus:text-[#00BFA5]"
                      >
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Investigator
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="admin"
                        className="text-[#E6EDF3] focus:bg-[#6C63FF]/10 focus:text-[#6C63FF]"
                      >
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Admin
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-[#00BFA5] text-[#0D1117] hover:bg-[#03DAC6] mt-2"
            >
              {page === "login" && "Secure Login"}
              {page === "signup" && "Create Account"}
              {page === "forgot-password" && "Send Reset Link"}
            </Button>

            {page === "login" && (
              <div className="flex justify-center items-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => onNavigate("signup")}
                  className="text-[#9BA1A6] hover:text-[#00BFA5] p-0"
                >
                  Create account
                </Button>
              </div>
            )}

            {(page === "signup" || page === "forgot-password") && (
              <Button
                type="button"
                variant="link"
                onClick={() => onNavigate("login")}
                className="w-full text-[#9BA1A6] hover:text-[#00BFA5]"
              >
                Back to login
              </Button>
            )}
          </form>

          <div className="mt-6 pt-6 border-t border-[#30363D]">
            <p className="text-center text-[#9BA1A6]">
              Authorized Personnel Only
            </p>
            <p className="text-center text-[#9BA1A6]/60 mt-1">
              All access is logged and monitored
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
