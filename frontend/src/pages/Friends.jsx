import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserPlus, Check, X, Users, Search } from "lucide-react";
import toast from "react-hot-toast";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function Friends() {
  const { user: currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("requests");

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, []);

  const fetchData = async (signal) => {
    setLoading(true);
    try {
      const { data: followersRes } = await api.get("/user/followers", { signal });

      const { followers, following, followRequests } = followersRes;

      setRequests(followRequests || []);

      const friendMap = new Map();
      followers.forEach((u) => friendMap.set(u._id, { ...u, type: "follower" }));
      following.forEach((u) => {
        if (friendMap.has(u._id)) {
          friendMap.set(u._id, { ...friendMap.get(u._id), type: "friend" });
        } else {
          friendMap.set(u._id, { ...u, type: "following" });
        }
      });
      setFriends(Array.from(friendMap.values()));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (senderId) => {
    try {
      await api.post("/user/respondFollowReq", { senderId, accept: true });
      toast.success("Friend request accepted!");
      setRequests((prev) => prev.filter((r) => r._id !== senderId));
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const handleReject = async (senderId) => {
    try {
      await api.post("/user/respondFollowReq", { senderId, accept: false });
      toast.success("Friend request removed");
      setRequests((prev) => prev.filter((r) => r._id !== senderId));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const handleRemoveFriend = async (userId) => {
    try {
      await api.post(`/user/${userId}/unfollow`);
      toast.success("Friend removed");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh] bg-[#F2ECE0]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-[#D8CFBC]" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#35503F] animate-spin" />
          </div>
          <p className="text-xs tracking-[0.2em] uppercase text-[#6B6558] font-mono">
            Loading friends
          </p>
        </div>
      </div>
    );
  }

  const mutualFriends = friends.filter((f) => f.type === "friend");
  const onlyFollowing = friends.filter((f) => f.type === "following");
  const onlyFollowers = friends.filter((f) => f.type === "follower");

  const tabs = [
    { id: "requests", label: "Requests", count: requests.length },
    { id: "friends", label: "Friends", count: mutualFriends.length },
    { id: "following", label: "Following", count: onlyFollowing.length },
    { id: "followers", label: "Followers", count: onlyFollowers.length },
  ];

  return (
    <div className="bg-[#F2ECE0] min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10 pb-8 border-b border-[#D8CFBC]">
          <p className="text-xs tracking-[0.25em] uppercase text-[#B8863B] font-mono mb-3">
            Social
          </p>
          <h1
            className="text-4xl sm:text-5xl font-semibold text-[#202A22] leading-tight"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Friends
          </h1>
          <p className="text-[#6B6558] mt-3 max-w-md">
            Manage your connections and friend requests.
          </p>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium whitespace-nowrap transition ${
                tab === t.id
                  ? "bg-[#202A22] text-[#F2ECE0]"
                  : "bg-white border border-[#D8CFBC] text-[#6B6558] hover:border-[#B8863B]/40 hover:text-[#202A22]"
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span
                  className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                    tab === t.id
                      ? "bg-[#F2ECE0]/20 text-[#F2ECE0]"
                      : "bg-[#E7DFCE] text-[#6B6558]"
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === "requests" && (
          <div>
            {requests.length === 0 ? (
              <div className="flex flex-col items-center text-center py-20 border border-dashed border-[#D8CFBC] rounded-sm">
                <UserPlus size={24} strokeWidth={1.5} className="text-[#B8863B] mb-3" />
                <p className="text-[#6B6558] text-sm">No pending friend requests</p>
              </div>
            ) : (
              <div className="space-y-2">
                {requests.map((r) => (
                  <div
                    key={r._id}
                    className="flex items-center gap-4 p-4 bg-white border border-[#D8CFBC] rounded-md"
                  >
                    <Link to={`/profile/${r._id}`}>
                      {r.avatar ? (
                        <img
                          src={r.avatar}
                          alt=""
                          className="w-11 h-11 rounded-full object-cover ring-1 ring-[#D8CFBC]"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-[#35503F] text-[#F2ECE0] flex items-center justify-center text-sm font-semibold">
                          {r.name?.charAt(0)}
                        </div>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/profile/${r._id}`}
                        className="font-medium text-sm text-[#202A22] hover:text-[#35503F] transition"
                      >
                        {r.name}
                      </Link>
                      <p className="text-xs text-[#9A9384] font-mono">wants to be your friend</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(r._id)}
                        className="p-2 bg-[#35503F] text-[#F2ECE0] rounded-md hover:bg-[#202A22] transition"
                        title="Accept"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => handleReject(r._id)}
                        className="p-2 bg-white border border-[#D8CFBC] text-[#6B6558] rounded-md hover:border-[#A23B3B]/40 hover:text-[#A23B3B] transition"
                        title="Reject"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "friends" && (
          <div>
            {mutualFriends.length === 0 ? (
              <div className="flex flex-col items-center text-center py-20 border border-dashed border-[#D8CFBC] rounded-sm">
                <Users size={24} strokeWidth={1.5} className="text-[#B8863B] mb-3" />
                <p className="text-[#6B6558] text-sm">
                  No mutual friends yet. Send a friend request to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {mutualFriends.map((f) => (
                  <div
                    key={f._id}
                    className="flex items-center gap-4 p-4 bg-white border border-[#D8CFBC] rounded-md"
                  >
                    <Link to={`/profile/${f._id}`}>
                      {f.avatar ? (
                        <img
                          src={f.avatar}
                          alt=""
                          className="w-11 h-11 rounded-full object-cover ring-1 ring-[#D8CFBC]"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-[#35503F] text-[#F2ECE0] flex items-center justify-center text-sm font-semibold">
                          {f.name?.charAt(0)}
                        </div>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/profile/${f._id}`}
                        className="font-medium text-sm text-[#202A22] hover:text-[#35503F] transition"
                      >
                        {f.name}
                      </Link>
                      <p className="text-xs text-[#9A9384] font-mono">mutual friend</p>
                    </div>
                    <button
                      onClick={() => handleRemoveFriend(f._id)}
                      className="px-3 py-1.5 text-xs font-medium text-[#6B6558] border border-[#D8CFBC] rounded-md hover:border-[#A23B3B]/40 hover:text-[#A23B3B] transition"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "following" && (
          <div>
            {onlyFollowing.length === 0 ? (
              <div className="flex flex-col items-center text-center py-20 border border-dashed border-[#D8CFBC] rounded-sm">
                <Users size={24} strokeWidth={1.5} className="text-[#B8863B] mb-3" />
                <p className="text-[#6B6558] text-sm">
                  You're not following anyone yet.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {onlyFollowing.map((f) => (
                  <div
                    key={f._id}
                    className="flex items-center gap-4 p-4 bg-white border border-[#D8CFBC] rounded-md"
                  >
                    <Link to={`/profile/${f._id}`}>
                      {f.avatar ? (
                        <img
                          src={f.avatar}
                          alt=""
                          className="w-11 h-11 rounded-full object-cover ring-1 ring-[#D8CFBC]"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-[#35503F] text-[#F2ECE0] flex items-center justify-center text-sm font-semibold">
                          {f.name?.charAt(0)}
                        </div>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/profile/${f._id}`}
                        className="font-medium text-sm text-[#202A22] hover:text-[#35503F] transition"
                      >
                        {f.name}
                      </Link>
                      <p className="text-xs text-[#9A9384] font-mono">following</p>
                    </div>
                    <button
                      onClick={() => handleRemoveFriend(f._id)}
                      className="px-3 py-1.5 text-xs font-medium text-[#6B6558] border border-[#D8CFBC] rounded-md hover:border-[#A23B3B]/40 hover:text-[#A23B3B] transition"
                    >
                      Unfollow
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "followers" && (
          <div>
            {onlyFollowers.length === 0 ? (
              <div className="flex flex-col items-center text-center py-20 border border-dashed border-[#D8CFBC] rounded-sm">
                <Users size={24} strokeWidth={1.5} className="text-[#B8863B] mb-3" />
                <p className="text-[#6B6558] text-sm">
                  No followers yet.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {onlyFollowers.map((f) => (
                  <div
                    key={f._id}
                    className="flex items-center gap-4 p-4 bg-white border border-[#D8CFBC] rounded-md"
                  >
                    <Link to={`/profile/${f._id}`}>
                      {f.avatar ? (
                        <img
                          src={f.avatar}
                          alt=""
                          className="w-11 h-11 rounded-full object-cover ring-1 ring-[#D8CFBC]"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-[#35503F] text-[#F2ECE0] flex items-center justify-center text-sm font-semibold">
                          {f.name?.charAt(0)}
                        </div>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/profile/${f._id}`}
                        className="font-medium text-sm text-[#202A22] hover:text-[#35503F] transition"
                      >
                        {f.name}
                      </Link>
                      <p className="text-xs text-[#9A9384] font-mono">follows you</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
