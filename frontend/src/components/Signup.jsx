// src/components/Signup.jsx

import React, { useState } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import api from "../services/api";

export function Signup({ onNavigateToLogin, onSignup }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (
      !formData.username ||
      !formData.email ||
      !formData.role ||
      !formData.password
    ) {
      return "Please fill in all fields";
    }

    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match";
    }

    if (formData.password.length < 6) {
      return "Password must be at least 6 characters long";
    }

    if (!formData.email.includes("@")) {
      return "Please enter a valid email address";
    }

    return null;
  };


const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError("");

  const validationError = validateForm();
  if (validationError) {
    setError(validationError);
    setIsLoading(false);
    return;
  }

  try {
    const response = await api.post("/auth/signup", {
      username: formData.username,
      email: formData.email,
      role: formData.role.toLowerCase(), // backend expects "admin" / "investigator"
      password: formData.password,
    });

    onSignup(response.data); // Pass user data back to App
  } catch (err) {
  const detail = err.response?.data?.detail;

  if (Array.isArray(detail)) {
    // Extract "msg" from each error object
    setError(detail.map((d) => d.msg).join(", "));
  } else if (typeof detail === "string") {
    setError(detail);
  } else {
    setError("Login failed");
  }
}
};


    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Beautiful Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/90 to-indigo-900">
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600/10 via-transparent to-purple-600/10"></div>
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-3/4 right-1/3 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl animate-pulse delay-500"></div>
          </div>

          {/* Subtle Grid Pattern */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          ></div>

          {/* Floating Particles */}
          <div className="absolute inset-0">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white/40 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 3}s`,
                }}
              ></div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md space-y-8">
            {/* Header */}
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center mb-8">
                <div className="relative group">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl backdrop-blur-sm border border-white/20 group-hover:scale-105 transition-transform duration-300">
                    <svg
                      className="w-10 h-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      />
                    </svg>
                  </div>
                  <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/30 to-indigo-600/30 rounded-full blur-2xl -z-10 group-hover:blur-3xl transition-all duration-300"></div>
                </div>
              </div>
              <div>
                <h1 className="text-4xl text-white mb-2 drop-shadow-lg">
                  Create Account
                </h1>
                <p className="text-blue-100/80 text-lg">
                  Join the AI Forensic Assistant platform
                </p>
              </div>
            </div>

            {/* Glassmorphism Signup Form */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl"></div>

                <form onSubmit={handleSubmit} className="relative space-y-5">
                  <div className="grid grid-cols-1 gap-5">
                    <div className="space-y-3">
                      <Label
                        htmlFor="username"
                        className="text-white/90 text-sm block"
                      >
                        Username
                      </Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="Enter your username"
                        value={formData.username}
                        onChange={(e) =>
                          handleInputChange("username", e.target.value)
                        }
                        disabled={isLoading}
                        className="w-full h-12 bg-white/10 border border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm focus:bg-white/15 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 rounded-xl transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="email"
                        className="text-white/90 text-sm block"
                      >
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        disabled={isLoading}
                        className="w-full h-12 bg-white/10 border border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm focus:bg-white/15 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 rounded-xl transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="role"
                        className="text-white/90 text-sm block"
                      >
                        Role
                      </Label>
                      <select
                        id="role"
                        value={formData.role}
                        onChange={(e) =>
                          handleInputChange("role", e.target.value)
                        }
                        disabled={isLoading}
                        className="w-full h-12 bg-white/10 border border-white/20 text-white backdrop-blur-sm px-3 py-2 text-sm focus:bg-white/15 focus:border-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-400/20 rounded-xl disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                      >
                        <option value="" className="text-slate-900 bg-white">
                          Select your role
                        </option>
                        <option
                          value="Admin"
                          className="text-slate-900 bg-white"
                        >
                          Admin
                        </option>
                        <option
                          value="Investigator"
                          className="text-slate-900 bg-white"
                        >
                          Investigator
                        </option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="password"
                        className="text-white/90 text-sm block"
                      >
                        Password
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                        disabled={isLoading}
                        className="w-full h-12 bg-white/10 border border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm focus:bg-white/15 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 rounded-xl transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="confirmPassword"
                        className="text-white/90 text-sm block"
                      >
                        Confirm Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          handleInputChange("confirmPassword", e.target.value)
                        }
                        disabled={isLoading}
                        className="w-full h-12 bg-white/10 border border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm focus:bg-white/15 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 rounded-xl transition-all duration-200"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="text-sm text-red-200 bg-red-500/20 backdrop-blur-sm p-4 rounded-xl border border-red-400/30">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 rounded-xl shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Creating account...
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </div>
            </div>

            {/* Glassmorphism Role Information */}
            <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>
              <div className="relative">
                <h3 className="text-sm mb-4 text-white/70">
                  Role Permissions:
                </h3>
                <div className="text-sm space-y-3 text-white/60">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>
                      <strong className="text-blue-300">Admin:</strong> Full
                      system access, user management, all forensic tools
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                    <span>
                      <strong className="text-indigo-300">Investigator:</strong>{" "}
                      Evidence analysis, case management, reporting tools
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Switch to Login */}
            <div className="text-center">
              <p className="text-sm text-white/70">
                Already have an account?{" "}
                <button
                  onClick={onNavigateToLogin}
                  className="text-blue-300 hover:text-blue-200 underline hover:no-underline transition-colors duration-200 ml-1"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };
