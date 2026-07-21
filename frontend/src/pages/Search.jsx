import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search as SearchIcon, MapPin } from "lucide-react";
import api from "../utils/api";
import PinCard from "../components/PinCard";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [users, setUsers] = useState([]);
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    if (!query) return;
    const controller = new AbortController();
    setLoading(true);
    const fetchResults = async () => {
      try {
        const res = await api.get(`/pin/search?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        setUsers(res.data.users);
        setPins(res.data.pins);
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          console.error("Search failed");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
    return () => controller.abort();
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    }
  };

  return (
    <div className="bg-[#F2ECE0] min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10 pb-8 border-b border-[#D8CFBC]">
          <p className="text-xs tracking-[0.25em] uppercase text-[#B8863B] font-mono mb-3">
            Search
          </p>
          <h1
            className="text-4xl sm:text-5xl font-semibold text-[#202A22] leading-tight"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Find
          </h1>
        </div>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-md">
            <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6558]" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search users or pins..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-[#D8CFBC] rounded-md text-sm text-[#202A22] focus:outline-none focus:ring-1 focus:ring-[#35503F] focus:border-[#35503F] transition placeholder:text-[#9A9384]"
            />
          </div>
        </form>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 rounded-full border-2 border-[#D8CFBC]" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#35503F] animate-spin" />
              </div>
            </div>
          </div>
        ) : query ? (
          <div>
            {users.length > 0 && (
              <div className="mb-8">
                <p className="text-xs tracking-[0.25em] uppercase text-[#B8863B] font-mono mb-4">
                  People · {users.length}
                </p>
                <div className="space-y-2">
                  {users.map((u) => (
                    <Link
                      key={u._id}
                      to={`/profile/${u._id}`}
                      className="flex items-center gap-3 p-4 bg-white border border-[#D8CFBC] rounded-md hover:border-[#B8863B]/40 transition"
                    >
                      {u.avatar ? (
                        <img src={u.avatar} alt="" className="w-10 h-10 rounded-full object-cover ring-1 ring-[#D8CFBC]" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#35503F] text-[#F2ECE0] flex items-center justify-center text-sm font-semibold">
                          {u.name?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm text-[#202A22]">{u.name}</p>
                        {u.email && <p className="text-xs text-[#9A9384] font-mono truncate">{u.email}</p>}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {pins.length > 0 && (
              <div>
                <p className="text-xs tracking-[0.25em] uppercase text-[#B8863B] font-mono mb-4">
                  Pins · {pins.length}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pins.map((pin) => (
                    <PinCard key={pin._id} pin={pin} />
                  ))}
                </div>
              </div>
            )}

            {users.length === 0 && pins.length === 0 && (
              <div className="flex flex-col items-center text-center py-20 border border-dashed border-[#D8CFBC] rounded-sm">
                <MapPin size={24} strokeWidth={1.5} className="text-[#B8863B] mb-3" />
                <p className="text-[#6B6558] text-sm">No results found for "{query}"</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center text-center py-20 border border-dashed border-[#D8CFBC] rounded-sm">
            <SearchIcon size={24} strokeWidth={1.5} className="text-[#9A9384] mb-3" />
            <p className="text-[#6B6558] text-sm">Search for pins, places, or people</p>
          </div>
        )}
      </div>
    </div>
  );
}
