import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Settings, MapPin, Check, X, Compass } from "lucide-react";
import toast from "react-hot-toast";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import PinCard from "../components/PinCard";
import TripCard from "../components/TripCard";

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [pins, setPins] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("pins");

  useEffect(() => {
    const controller = new AbortController();
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const [profileRes, tripsRes] = await Promise.all([
          api.get(`/user/${id}`, { signal: controller.signal }),
          api.get(`/trips/user/${id}`, { signal: controller.signal }),
        ]);
        setProfile(profileRes.data.user);
        setPins(profileRes.data.pins || []);
        setTrips(tripsRes.data.trips || []);
        setLoading(false);
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          toast.error(err.response?.data?.message || "Failed to load profile");
          setLoading(false);
        }
      }
    };
    fetchProfile();
    return () => controller.abort();
  }, [id]);

  const handleAddFriend = async () => {
    setActionLoading(true);
    try {
      const res = await api.post(`/user/followReq/${id}`);
      toast.success(res.data.message);
      setProfile((prev) => ({
        ...prev,
        hasSentRequest: true,
        isFriend: res.data.autoAccepted || false,
        isFollowing: res.data.autoAccepted || prev.isFollowing,
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    setActionLoading(true);
    try {
      await api.post("/user/respondFollowReq", { senderId: id, accept: true });
      toast.success("Friend request accepted!");
      setProfile((prev) => ({
        ...prev,
        hasReceivedRequest: false,
        isFriend: true,
        isFollowing: true,
        followerCount: (prev.followerCount || 0) + 1,
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRequest = async () => {
    setActionLoading(true);
    try {
      await api.post("/user/respondFollowReq", { senderId: id, accept: false });
      toast.success("Friend request removed");
      setProfile((prev) => ({
        ...prev,
        hasReceivedRequest: false,
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    setActionLoading(true);
    try {
      await api.post(`/user/${id}/unfollow`);
      toast.success("Friend removed");
      setProfile((prev) => ({
        ...prev,
        isFriend: false,
        isFollowing: false,
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setActionLoading(false);
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
            Reading the log
          </p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const isOwn = currentUser?._id === profile._id;

  const renderAction = () => {
    if (isOwn) {
      return (
        <Link
          to="/settings"
          className="px-5 py-2 rounded-md text-sm font-medium bg-[#E7DFCE] text-[#6B6558] hover:bg-[#E0D8C4] transition"
        >
          Edit Profile
        </Link>
      );
    }
    if (!currentUser) return null;

    if (profile.hasReceivedRequest) {
      return (
        <div className="flex gap-2">
          <button
            onClick={handleAcceptRequest}
            disabled={actionLoading}
            className="px-5 py-2 rounded-md text-sm font-medium bg-[#35503F] text-[#F2ECE0] hover:bg-[#202A22] transition disabled:opacity-60 flex items-center gap-1.5"
          >
            <Check size={14} /> Accept
          </button>
          <button
            onClick={handleRejectRequest}
            disabled={actionLoading}
            className="px-5 py-2 rounded-md text-sm font-medium bg-white border border-[#D8CFBC] text-[#6B6558] hover:border-[#A23B3B]/40 hover:text-[#A23B3B] transition disabled:opacity-60"
          >
            <X size={14} />
          </button>
        </div>
      );
    }

    if (profile.isFriend) {
      return (
        <button
          onClick={handleRemoveFriend}
          disabled={actionLoading}
          className="px-5 py-2 rounded-md text-sm font-medium bg-[#E7DFCE] text-[#6B6558] hover:bg-[#E0D8C4] transition disabled:opacity-60"
        >
          Friends
        </button>
      );
    }

    if (profile.hasSentRequest) {
      return (
        <button
          disabled
          className="px-5 py-2 rounded-md text-sm font-medium bg-[#E7DFCE] text-[#9A9384] cursor-not-allowed"
        >
          Request Sent
        </button>
      );
    }

    if (profile.isFollowing) {
      return (
        <div className="flex gap-2">
          <button
            disabled
            className="px-5 py-2 rounded-md text-sm font-medium bg-[#E7DFCE] text-[#6B6558] cursor-default"
          >
            Following
          </button>
          <button
            onClick={handleRemoveFriend}
            disabled={actionLoading}
            className="px-5 py-2 rounded-md text-sm font-medium bg-white border border-[#D8CFBC] text-[#6B6558] hover:border-[#A23B3B]/40 hover:text-[#A23B3B] transition disabled:opacity-60"
          >
            Unfollow
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={handleAddFriend}
        disabled={actionLoading}
        className="px-5 py-2 rounded-md text-sm font-medium bg-[#202A22] text-[#F2ECE0] hover:bg-[#35503F] transition disabled:opacity-60"
      >
        {actionLoading ? "Sending..." : "Add Friend"}
      </button>
    );
  };

  return (
    <div className="max-w-5xl mx-auto bg-[#F2ECE0] min-h-screen px-6 py-12">
      <div className="bg-white border border-[#D8CFBC] rounded-md p-8 md:p-10 mb-10">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt=""
              className="w-24 h-24 rounded-md object-cover ring-1 ring-[#D8CFBC]"
            />
          ) : (
            <div className="w-24 h-24 rounded-md bg-[#35503F] text-[#F2ECE0] flex items-center justify-center text-3xl font-semibold">
              {profile.name?.charAt(0)}
            </div>
          )}
          <div className="text-center sm:text-left flex-1">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <h1
                className="text-2xl text-[#202A22]"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                {profile.name}
              </h1>
              {renderAction()}
            </div>
            {profile.bio && (
              <p className="text-[#6B6558] mt-2 text-sm">{profile.bio}</p>
            )}
            <div className="flex gap-6 mt-5 justify-center sm:justify-start">
              {[
                { count: pins.length, label: "pins" },
                { count: trips.length, label: "trips" },
                { count: profile.followerCount || 0, label: "followers" },
                { count: profile.followingCount || 0, label: "following" },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className={`text-center ${
                    i > 0 ? "pl-6 border-l border-[#EDE7D9]" : ""
                  }`}
                >
                  <p
                    className="text-lg text-[#202A22]"
                    style={{ fontFamily: "'Fraunces', serif" }}
                  >
                    {stat.count}
                  </p>
                  <p className="text-xs text-[#9A9384] font-mono uppercase tracking-wide mt-0.5">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isOwn && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <Link
              to="/create"
              className="px-4 py-2 rounded-md text-sm font-medium bg-[#202A22] text-[#F2ECE0] hover:bg-[#35503F] transition"
            >
              Create Pin
            </Link>
            <Link
              to="/trip/create"
              className="px-4 py-2 rounded-md text-sm font-medium bg-[#E7DFCE] text-[#6B6558] hover:bg-[#D8CFBC] transition"
            >
              Create Trip
            </Link>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-6 border-b border-[#D8CFBC] pb-2">
        <button
          onClick={() => setActiveTab("pins")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${
            activeTab === "pins"
              ? "bg-[#202A22] text-[#F2ECE0]"
              : "text-[#6B6558] hover:bg-[#E7DFCE]"
          }`}
        >
          <MapPin size={16} />
          Pins ({pins.length})
        </button>
        <button
          onClick={() => setActiveTab("trips")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${
            activeTab === "trips"
              ? "bg-[#202A22] text-[#F2ECE0]"
              : "text-[#6B6558] hover:bg-[#E7DFCE]"
          }`}
        >
          <Compass size={16} />
          Trips ({trips.length})
        </button>
      </div>

      {activeTab === "pins" && (
        pins.length === 0 ? (
          <div className="flex flex-col items-center text-center py-20 border border-dashed border-[#D8CFBC] rounded-sm">
            <MapPin size={24} strokeWidth={1.5} className="text-[#B8863B] mb-3" />
            <p className="text-[#6B6558] text-sm">No pins yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pins.map((pin) => (
              <PinCard key={pin._id} pin={pin} />
            ))}
          </div>
        )
      )}

      {activeTab === "trips" && (
        trips.length === 0 ? (
          <div className="flex flex-col items-center text-center py-20 border border-dashed border-[#D8CFBC] rounded-sm">
            <Compass size={24} strokeWidth={1.5} className="text-[#B8863B] mb-3" />
            <p className="text-[#6B6558] text-sm">No trips yet</p>
            {isOwn && (
              <Link
                to="/trip/create"
                className="mt-4 text-sm text-[#35503F] hover:text-[#202A22] transition font-medium"
              >
                Create a trip
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <TripCard key={trip._id} trip={trip} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
