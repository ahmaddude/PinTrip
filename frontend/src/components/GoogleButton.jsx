import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function GoogleButton({ mode = "login" }) {
  const { googleLogin } = useAuth();
  const btnRef = useRef(null);

  useEffect(() => {
    if (!window.google) return;

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async (response) => {
        try {
          await googleLogin(response.credential);
          toast.success(mode === "login" ? "Welcome back!" : "Account created!");
          window.location.href = "/";
        } catch (err) {
          toast.error(err.response?.data?.message || "Google sign-in failed");
        }
      },
    });

    window.google.accounts.id.renderButton(btnRef.current, {
      theme: "outline",
      size: "large",
      width: btnRef.current.offsetWidth,
      text: mode === "login" ? "signin_with" : "signup_with",
    });
  }, []);

  return (
    <div className="flex justify-center">
      <div ref={btnRef} />
    </div>
  );
}
