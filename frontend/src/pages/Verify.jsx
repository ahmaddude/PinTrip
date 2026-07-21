import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { MapPin } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Verify() {
  const { verify } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verify({ email, code });
      toast.success("Email verified! You can now log in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");
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
            Verify your email
          </h2>
          <p className="text-[#9A9384] text-center text-sm mb-8">
            We sent a 6-digit code to <strong className="text-[#6B6558]">{email || "your email"}</strong>
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs tracking-[0.2em] uppercase text-[#9A9384] font-mono mb-2">
                Verification Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-3 border border-[#D8CFBC] rounded-md text-sm text-center text-2xl tracking-[0.5em] font-mono text-[#202A22] focus:outline-none focus:ring-1 focus:ring-[#35503F] focus:border-[#35503F]"
                placeholder="000000"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#202A22] text-[#F2ECE0] rounded-md font-medium hover:bg-[#35503F] transition disabled:opacity-50 text-sm tracking-wide"
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          </form>

          <p className="text-center text-sm text-[#9A9384] mt-6">
            <Link to="/signup" className="text-[#35503F] font-medium hover:text-[#202A22] transition">
              Back to sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
