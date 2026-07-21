import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
      toast.success("Check your email for reset code");
    } catch (err) {
      toast.error(err.response?.data?.message || "Request failed");
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
            Forgot password?
          </h2>
          <p className="text-[#9A9384] text-center text-sm mb-8">
            {sent
              ? "We've sent a reset code to your email."
              : "Enter your email and we'll send you a reset code."}
          </p>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs tracking-[0.2em] uppercase text-[#9A9384] font-mono mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-[#D8CFBC] rounded-md text-sm text-[#202A22] focus:outline-none focus:ring-1 focus:ring-[#35503F] focus:border-[#35503F] transition placeholder:text-[#9A9384]"
                  placeholder="you@example.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#202A22] text-[#F2ECE0] rounded-md font-medium hover:bg-[#35503F] transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm tracking-wide"
              >
                {loading ? (
                  "Sending..."
                ) : (
                  <>
                    Send reset code <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <Link
              to="/reset-password"
              state={{ email }}
              className="block w-full py-3 bg-[#202A22] text-[#F2ECE0] rounded-md font-medium hover:bg-[#35503F] transition text-center text-sm tracking-wide"
            >
              Enter reset code
            </Link>
          )}

          <p className="text-center text-sm text-[#9A9384] mt-6">
            <Link to="/login" className="text-[#35503F] font-medium hover:text-[#202A22] transition">
              Back to log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
