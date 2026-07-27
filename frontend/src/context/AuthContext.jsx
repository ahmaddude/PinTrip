import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";
import { connectSocket, disconnectSocket } from "../utils/socket";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await api.get("/auth/check-auth");
      setUser(res.data.user);
      connectSocket(res.data.user._id);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
    return () => disconnectSocket();
  }, []);

  const signup = async (data) => {
    const res = await api.post("/auth/signup", data);
    return res.data;
  };

  const verify = async (data) => {
    const res = await api.post("/auth/verify", data);
    return res.data;
  };

  const login = async (data) => {
    const res = await api.post("/auth/login", data);
    setUser(res.data.user);
    connectSocket(res.data.user._id);
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // clear local state even if API fails
    } finally {
      disconnectSocket();
      setUser(null);
    }
  };

  const googleLogin = async (token) => {
    const res = await api.post("/auth/google", { token });
    setUser(res.data.user);
    connectSocket(res.data.user._id);
    return res.data;
  };

  const updateProfile = async (formData) => {
    const res = await api.put("/auth/update-profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setUser(res.data.user);
    return res.data;
  };

  const forgotPassword = async (email) => {
    const res = await api.post("/auth/forgot-password", { email });
    return res.data;
  };

  const resetPassword = async ({ email, code, password }) => {
    const res = await api.post("/auth/reset-password", { email, code, password });
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signup,
        verify,
        login,
        logout,
        googleLogin,
        updateProfile,
        forgotPassword,
        resetPassword,
        checkAuth,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
