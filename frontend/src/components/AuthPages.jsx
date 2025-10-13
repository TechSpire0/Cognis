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
import { Mail, Lock, AlertCircle } from "lucide-react";
import cognisLogo from "../assets/Cognis.jpg";
import * as api from "../services/api";

export function AuthPages({ onNavigate }) {
  const [mode, setMode] = useState("login"); // "login" | "reset" | "forgot"
  const [form, setForm] = useState({
    email: "",
    password: "",
    old_password: "",
    new_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await api.login({
        email: form.email,
        password: form.password,
      });

      // 🔐 Store the token immediately
      if (data?.access_token) {
        localStorage.setItem("token", data.access_token);
      }

      // Handle forced password reset
      if (data?.detail?.includes("Password reset required")) {
        setMode("reset");
        return;
      }

      // If no token returned but a detail message exists
      if (!data?.access_token && data?.detail) {
        throw new Error(data.detail);
      }

      // ✅ Fetch current user with stored token
      const user = await api.getCurrentUser();

      if (user.role === "admin") onNavigate("admin-dashboard");
      else onNavigate("dashboard");
    } catch (err) {
      let message = "Login failed. Please check your credentials.";
      if (err.status === 401 || /invalid/i.test(err.message)) {
        message = "Invalid username or password.";
      } else if (err.message?.includes("inactive")) {
        message = "Account inactive. Contact your admin.";
      } else if (err.message?.includes("Password reset required")) {
        setMode("reset");
        return;
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordReset(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.changePassword({
        username_or_email: form.email,
        old_password: form.old_password,
        new_password: form.new_password,
      });
      alert("✅ Password changed successfully. Please log in again.");
      setMode("login");
    } catch (err) {
      let message = "Password reset failed.";
      if (err.status === 400 || err.message?.includes("old")) {
        message = "Incorrect temporary password.";
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const titleMap = {
    login: "Secure Login",
    reset: "Reset Password",
    forgot: "Forgot Password",
  };

  const descMap = {
    login: "Access the COGNIS UFDR Analysis Platform",
    reset: "Change your temporary password to continue",
    forgot: "Contact your system administrator to reset your password",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1117] via-[#161B22] to-[#0D1117] flex items-center justify-center p-6">
      {/* Background pattern */}
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

          <CardTitle className="text-[#E6EDF3]">{titleMap[mode]}</CardTitle>
          <CardDescription className="text-[#9BA1A6]">
            {descMap[mode]}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* LOGIN FORM */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#E6EDF3]">
                  Username / Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-[#9BA1A6]" />
                  <Input
                    id="email"
                    type="text"
                    placeholder="investigator@agency.gov"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    required
                    className="pl-10 bg-[#0D1117] border-[#30363D] text-[#E6EDF3] placeholder:text-[#9BA1A6]/60"
                  />
                </div>
              </div>

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
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    required
                    className="pl-10 bg-[#0D1117] border-[#30363D] text-[#E6EDF3] placeholder:text-[#9BA1A6]/60"
                  />
                </div>
              </div>

              {/* Error Feedback */}
              {error && (
                <div className="flex items-center justify-center gap-2 bg-[#2D1E1E] border border-red-500/30 text-red-400 text-sm p-2 rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00BFA5] text-[#0D1117] hover:bg-[#03DAC6] mt-2 disabled:opacity-50"
              >
                {loading ? "Authenticating..." : "Secure Login"}
              </Button>

              <div className="flex justify-center items-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setMode("forgot")}
                  className="text-[#9BA1A6] hover:text-[#00BFA5] p-0"
                >
                  Forgot password?
                </Button>
              </div>
            </form>
          )}

          {/* RESET PASSWORD FORM */}
          {mode === "reset" && (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#E6EDF3]">
                  Username / Email
                </Label>
                <Input
                  id="email"
                  type="text"
                  value={form.email}
                  readOnly
                  className="bg-[#0D1117] border-[#30363D] text-[#9BA1A6]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="old_password" className="text-[#E6EDF3]">
                  Temporary Password
                </Label>
                <Input
                  id="old_password"
                  type="password"
                  value={form.old_password}
                  onChange={(e) =>
                    setForm({ ...form, old_password: e.target.value })
                  }
                  required
                  placeholder="Enter temporary password"
                  className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_password" className="text-[#E6EDF3]">
                  New Password
                </Label>
                <Input
                  id="new_password"
                  type="password"
                  value={form.new_password}
                  onChange={(e) =>
                    setForm({ ...form, new_password: e.target.value })
                  }
                  required
                  placeholder="Enter new password"
                  className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3]"
                />
              </div>

              {error && (
                <div className="flex items-center justify-center gap-2 bg-[#2D1E1E] border border-red-500/30 text-red-400 text-sm p-2 rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00BFA5] text-[#0D1117] hover:bg-[#03DAC6] mt-2 disabled:opacity-50"
              >
                {loading ? "Updating..." : "Change Password"}
              </Button>

              <Button
                type="button"
                variant="link"
                onClick={() => setMode("login")}
                className="w-full text-[#9BA1A6] hover:text-[#00BFA5]"
              >
                Back to Login
              </Button>
            </form>
          )}

          {/* FORGOT PASSWORD INFO */}
          {mode === "forgot" && (
            <div className="space-y-6">
              <p className="text-[#E6EDF3] text-center leading-relaxed">
                If you’ve forgotten your password, please contact your
                <span className="text-[#00BFA5]">
                  {" "}
                  Cognis system administrator{" "}
                </span>
                to have it reset.
              </p>

              <Button
                type="button"
                variant="link"
                onClick={() => setMode("login")}
                className="w-full text-[#9BA1A6] hover:text-[#00BFA5]"
              >
                Back to Login
              </Button>
            </div>
          )}

          {/* Footer */}
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
