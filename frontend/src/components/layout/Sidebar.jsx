import { NavLink } from "react-router-dom";
import { Home, Compass, Map, Plus, User, Users, X, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const [requestCount, setRequestCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchCount = async () => {
      try {
        const res = await api.get("/user/followers");
        setRequestCount(res.data.followRequests?.length || 0);
      } catch {}
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const links = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/explore", icon: Compass, label: "Explore" },
    { to: "/friends", icon: Users, label: "Friends", badge: requestCount },
    { to: "/map", icon: Map, label: "Map" },
    { to: "/create", icon: Plus, label: "Create Pin" },
    { to: "/trip/create", icon: MapPin, label: "Create Trip" },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#202A22]/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-16 left-0 bottom-0 w-64 bg-[#F2ECE0]/95 backdrop-blur-xl border-r border-[#D8CFBC] z-40 transform transition-transform duration-200 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:sticky lg:top-16 lg:bottom-auto lg:h-[calc(100vh-4rem)]`}
      >
        <div className="p-4 flex flex-col h-full">
          <button
            onClick={onClose}
            className="lg:hidden self-end p-1.5 hover:bg-[#E7DFCE] rounded-md mb-2 text-[#6B6558]"
          >
            <X size={18} />
          </button>

          <p className="hidden lg:block text-xs tracking-[0.2em] uppercase text-[#9A9384] font-mono px-4 mt-2 mb-2">
            Navigate
          </p>

          <nav className="flex flex-col gap-1 flex-1 lg:mt-0 mt-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium border-l-2 transition-colors duration-150 ${
                    isActive
                      ? "bg-[#E7DFCE] text-[#202A22] border-[#B8863B]"
                      : "text-[#6B6558] border-transparent hover:bg-[#E7DFCE]/60 hover:text-[#202A22]"
                  }`
                }
              >
                <div className="relative">
                  <link.icon size={18} />
                  {link.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 flex items-center justify-center bg-[#A23B3B] text-[#F2ECE0] text-[10px] font-mono font-bold rounded-full px-1">
                      {link.badge}
                    </span>
                  )}
                </div>
                {link.label}
              </NavLink>
            ))}
          </nav>

          {user && (
            <NavLink
              to={`/profile/${user._id}`}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium border-t border-[#D8CFBC] mt-2 pt-4 transition-colors duration-150 ${
                  isActive
                    ? "text-[#202A22]"
                    : "text-[#6B6558] hover:text-[#202A22]"
                }`
              }
            >
              <User size={18} />
              Profile
            </NavLink>
          )}
        </div>
      </aside>
    </>
  );
}