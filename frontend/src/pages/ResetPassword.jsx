import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { MapPin, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const [form, setForm] = useState({ code: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword({ email: email || form.email, code: form.code, password: form.password });
      toast.success("Password reset! You can now log in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2ECE0] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="bg-[#35503F] p-2 rounded-md">
              <MapPin size={22} className="text-[#F2ECE0]" />
            </div>
            <span
              className="text-2xl text-[#202A22]"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              PinTrip
            </span>
          </Link>
        </div>

        <div className="bg-white border border-[#D8CFBC] rounded-md p-8">
          <h2
            className="text-2xl text-center mb-1 text-[#202A22]"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Reset password
          </h2>
          <p className="text-[#9A9384] text-center text-sm mb-8">
            Enter the code from your email and your new password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!email && (
              <div>
                <label className="block text-xs tracking-[0.2em] uppercase text-[#9A9384] font-mono mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={form.email || ""}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 border border-[#D8CFBC] rounded-md text-sm text-[#202A22] focus:outline-none focus:ring-1 focus:ring-[#35503F] focus:border-[#35503F] transition placeholder:text-[#9A9384]"
                  placeholder="you@example.com"
                />
              </div>
            )}
            <div>
              <label className="block text-xs tracking-[0.2em] uppercase text-[#9A9384] font-mono mb-2">
                Verification Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="w-full px-4 py-3 border border-[#D8CFBC] rounded-md text-sm text-center text-2xl tracking-[0.5em] font-mono text-[#202A22] focus:outline-none focus:ring-1 focus:ring-[#35503F] focus:border-[#35503F]"
                placeholder="000000"
              />
            </div>
            <div>
              <label className="block text-xs tracking-[0.2em] uppercase text-[#9A9384] font-mono mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 border border-[#D8CFBC] rounded-md text-sm text-[#202A22] focus:outline-none focus:ring-1 focus:ring-[#35503F] focus:border-[#35503F] transition pr-11 placeholder:text-[#9A9384]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9384] hover:text-[#6B6558] transition"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#202A22] text-[#F2ECE0] rounded-md font-medium hover:bg-[#35503F] transition disabled:opacity-50 text-sm tracking-wide"
            >
              {loading ? "Resetting..." : "Reset password"}
            </button>
          </form>

          <p className="text-center text-sm text-[#9A9384] mt-6">
            <Link to="/forgot-password" className="text-[#35503F] font-medium hover:text-[#202A22] transition">
              Back to forgot password
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
