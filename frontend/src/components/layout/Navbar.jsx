import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, Plus, Users, User, LogOut, Menu, Compass } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
    setShowMenu(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F2ECE0]/90 backdrop-blur-xl border-b border-[#D8CFBC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 hover:bg-[#E7DFCE] rounded-md text-[#202A22] transition"
          >
            <Menu size={20} />
          </button>
          <Link to="/" className="flex items-center gap-2.5">
            <div className="bg-[#35503F] p-1.5 rounded-md">
              <MapPin size={18} className="text-[#F2ECE0]" />
            </div>
            <span
              className="hidden sm:inline text-xl text-[#202A22] tracking-tight"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              PinTrip
            </span>
          </Link>
        </div>

        <form onSubmit={handleSearch} className="flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6558]" />
            <input
              type="text"
              placeholder="Search pins, places, people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D8CFBC] rounded-md text-sm text-[#202A22] focus:outline-none focus:ring-1 focus:ring-[#35503F] focus:border-[#35503F] transition placeholder:text-[#9A9384]"
            />
          </div>
        </form>

        <div className="flex items-center gap-1.5">
          {user ? (
            <>
              <Link
                to="/create"
                className="flex items-center gap-1.5 bg-[#202A22] text-[#F2ECE0] px-4 py-2.5 rounded-md text-sm font-medium hover:bg-[#35503F] transition"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span className="hidden sm:inline">Create</span>
              </Link>
              <Link
                to="/map"
                className="p-2.5 hover:bg-[#E7DFCE] rounded-md text-[#6B6558] hover:text-[#35503F] transition hidden sm:flex"
              >
                <Compass size={20} />
              </Link>
              <Link
                to="/friends"
                className="p-2.5 hover:bg-[#E7DFCE] rounded-md text-[#6B6558] hover:text-[#35503F] transition"
              >
                <Users size={20} />
              </Link>
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 p-1 hover:bg-[#E7DFCE] rounded-md transition"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt=""
                      className="w-8 h-8 rounded-md object-cover ring-1 ring-[#D8CFBC]"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-md bg-[#B8863B] text-[#F2ECE0] flex items-center justify-center text-sm font-semibold">
                      {user.name?.charAt(0)}
                    </div>
                  )}
                </button>
                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 top-12 bg-white rounded-md shadow-lg shadow-[#20220000]/10 border border-[#D8CFBC] py-2 w-52 z-50">
                      <div className="px-4 py-3 border-b border-[#EDE7D9]">
                        <p className="text-sm font-medium text-[#202A22]">{user.name}</p>
                        <p className="text-xs text-[#6B6558] truncate">{user.email}</p>
                      </div>
                      <Link
                        to={`/profile/${user._id}`}
                        onClick={() => setShowMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#F2ECE0] text-sm text-[#202A22] transition"
                      >
                        <User size={16} /> Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#F4E4DE] text-sm w-full text-[#A23B3B] transition"
                      >
                        <LogOut size={16} /> Log out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2.5 text-sm font-medium text-[#6B6558] hover:text-[#202A22] transition"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2.5 text-sm font-medium bg-[#202A22] text-[#F2ECE0] rounded-md hover:bg-[#35503F] transition"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}