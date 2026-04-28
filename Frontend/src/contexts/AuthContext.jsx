import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAuthenticated = !!user;

  useEffect(() => {
    // Check local storage for persistent login on mount
    const initAuth = () => {
      try {
        const token = localStorage.getItem("edgeiq_token");
        const storedUser = localStorage.getItem("edgeiq_user");
        
        if (token && storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error("Failed to restore auth session:", err);
        localStorage.removeItem("edgeiq_token");
        localStorage.removeItem("edgeiq_user");
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      // We don't set loading to true here to avoid unmounting the app
      
      const response = await authAPI.login(email, password);
      
      if (response.success) {
        setUser(response.user);
        return response;
      } else {
        setError(response.error || "Login failed");
        return response;
      }
    } catch (err) {
      setError(err.message || "An error occurred");
      return { success: false, error: err.message };
    }
  };

  const register = async (email, password, username) => {
    try {
      setError(null);
      const response = await authAPI.register(email, password, username);
      
      if (response.success) {
        setUser(response.user);
        return response;
      } else {
        setError(response.error || "Registration failed");
        return response;
      }
    } catch (err) {
      setError(err.message || "An error occurred");
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("edgeiq_token");
      localStorage.removeItem("edgeiq_user");
      setUser(null);
      setError(null);
    }
  };

  const value = {
    isAuthenticated,
    user,
    login,
    register,
    logout,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
