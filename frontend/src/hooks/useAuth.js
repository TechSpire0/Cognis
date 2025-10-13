// src/hooks/useAuth.js
import { useState, useEffect } from "react";
import * as api from "../services/api";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    setLoading(true);
    const token = localStorage.getItem("cognis_token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const u = await api.getCurrentUser();
      setUser(u);
    } catch (e) {
      console.error("Failed to fetch user", e);
      localStorage.removeItem("cognis_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshUser();
  }, []);

  async function login({ email, username, password }) {
    const tokenResp = await api.login({ email, username, password });
    if (tokenResp?.access_token) {
      // fetch user
      const u = await api.getCurrentUser();
      setUser(u);
      return u;
    }
    throw new Error("Login failed");
  }

  function logout() {
    localStorage.removeItem("cognis_token");
    setUser(null);
  }

  return { user, login, logout, loading, refreshUser, isAuthenticated: !!user };
}
