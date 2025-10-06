// src/components/Login.jsx

import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import api from "../services/api";

export function Login({ onLogin, onNavigateToSignup }) {
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
  const response = await api.post(
    "/auth/login",
    new URLSearchParams({
      username: email, // works even if it's an email
      password,
    }),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  const { access_token } = response.data;
  localStorage.setItem("token", access_token);

  onLogin();
} catch (err) {
  setError(err.response?.data?.detail || "Login failed");
} finally {
  setIsLoading(false);
}
  }

  // ✅ make sure return is INSIDE the component
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/90 to-indigo-900">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600/10 via-transparent to-purple-600/10"></div>
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-2/3 left-1/2 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Grid Pattern */}
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
          {[...Array(25)].map((_, i) => (
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
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl border border-white/20 group-hover:scale-105 transition-transform duration-300">
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
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/30 to-indigo-600/30 rounded-full blur-2xl -z-10"></div>
              </div>
            </div>
            <h1 className="text-4xl text-white mb-2 drop-shadow-lg">
              AI Forensic Assistant
            </h1>
            <p className="text-blue-100/80 text-lg">
              Sign in to access your digital investigation workspace
            </p>
          </div>

          {/* Login Form */}
          <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-white/90 text-sm block">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full h-12 bg-white/10 border border-white/20 text-white placeholder:text-white/50 rounded-xl"
                />
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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full h-12 bg-white/10 border border-white/20 text-white placeholder:text-white/50 rounded-xl"
                />
              </div>

              {error && (
                <div className="text-sm text-red-200 bg-red-500/20 p-4 rounded-xl border border-red-400/30">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </div>

          {/* Demo Credentials */}
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg">
            <h3 className="text-sm mb-4 text-white/70">Demo Credentials:</h3>
            <div className="text-sm space-y-3 text-white/60">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>
                  <strong className="text-blue-300">Investigator:</strong>{" "}
                  detective.chen / forensics123
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                <span>
                  <strong className="text-indigo-300">Admin:</strong>{" "}
                  admin.johnson / forensics123
                </span>
              </div>
            </div>
          </div>

          {/* Switch to Signup */}
          <div className="text-center">
            <p className="text-sm text-white/70">
              Don't have an account?{" "}
              <button
                onClick={onNavigateToSignup}
                className="text-blue-300 hover:text-blue-200 underline ml-1"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
