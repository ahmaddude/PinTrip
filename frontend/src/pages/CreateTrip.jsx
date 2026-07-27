import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X, Globe, Users, Lock } from "lucide-react";
import toast from "react-hot-toast";
import api from "../utils/api";

const visibilityOptions = [
  { value: "public", label: "Public", icon: Globe, description: "Anyone can see this trip" },
  { value: "friends", label: "Friends", icon: Users, description: "Only friends can see this trip" },
  { value: "private", label: "Private", icon: Lock, description: "Only you can see this trip" },
];

export default function CreateTrip() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    visibility: "public",
  });
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userPins, setUserPins] = useState([]);
  const [selectedPins, setSelectedPins] = useState([]);
  const [showPinSelector, setShowPinSelector] = useState(false);

  useEffect(() => {
    fetchUserPins();
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  const fetchUserPins = async () => {
    try {
      const res = await api.get("/pin/pins?limit=100");
      setUserPins(res.data.pins || []);
    } catch (err) {
      console.error("Failed to fetch pins:", err);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setCoverPhoto(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("visibility", form.visibility);
      if (form.startDate) formData.append("startDate", form.startDate);
      if (form.endDate) formData.append("endDate", form.endDate);
      if (coverPhoto) formData.append("coverPhoto", coverPhoto);

      const res = await api.post("/trips/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const tripId = res.data.trip._id;

      if (selectedPins.length > 0) {
        for (let i = 0; i < selectedPins.length; i++) {
          await api.patch(`/trips/pin/${selectedPins[i]}/assign`, {
            tripId,
            tripOrder: i,
          });
        }
      }

      toast.success("Trip created!");
      navigate(`/trip/${tripId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create trip");
    } finally {
      setLoading(false);
    }
  };

  const togglePinSelection = (pinId) => {
    setSelectedPins((prev) =>
      prev.includes(pinId) ? prev.filter((id) => id !== pinId) : [...prev, pinId]
    );
  };

  return (
    <div className="bg-[#F2ECE0] min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-10 pb-8 border-b border-[#D8CFBC]">
          <p className="text-xs tracking-[0.25em] uppercase text-[#B8863B] font-mono mb-3">
            New Trip
          </p>
          <h1
            className="text-4xl sm:text-5xl font-semibold text-[#202A22] leading-tight"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Create a Trip
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white border border-[#D8CFBC] rounded-md p-6">
            <label className="block text-xs tracking-[0.2em] uppercase text-[#9A9384] font-mono mb-3">
              Cover Photo
            </label>
            {preview ? (
              <div className="relative">
                <img src={preview} alt="" className="w-full max-h-64 object-cover rounded-md" />
                <button
                  type="button"
                  onClick={() => { URL.revokeObjectURL(preview); setCoverPhoto(null); setPreview(null); }}
                  className="absolute top-2 right-2 p-1.5 bg-[#202A22] text-[#F2ECE0] rounded-md hover:bg-[#35503F] transition"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-40 border border-dashed border-[#D8CFBC] rounded-md cursor-pointer hover:border-[#B8863B] transition">
                <Upload size={28} strokeWidth={1.5} className="text-[#9A9384] mb-2" />
                <span className="text-sm text-[#6B6558]">Click to upload cover photo</span>
                <span className="text-xs text-[#9A9384] mt-1">Optional</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            )}
          </div>

          <div className="bg-white border border-[#D8CFBC] rounded-md p-6 space-y-5">
            <div>
              <label className="block text-xs tracking-[0.2em] uppercase text-[#9A9384] font-mono mb-2">
                Title *
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-3 border border-[#D8CFBC] rounded-md text-sm text-[#202A22] focus:outline-none focus:ring-1 focus:ring-[#35503F] focus:border-[#35503F] transition placeholder:text-[#9A9384]"
                placeholder="Japan 2024"
              />
            </div>
            <div>
              <label className="block text-xs tracking-[0.2em] uppercase text-[#9A9384] font-mono mb-2">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-[#D8CFBC] rounded-md text-sm text-[#202A22] focus:outline-none focus:ring-1 focus:ring-[#35503F] focus:border-[#35503F] transition resize-none placeholder:text-[#9A9384]"
                placeholder="Describe your adventure..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs tracking-[0.2em] uppercase text-[#9A9384] font-mono mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full px-4 py-3 border border-[#D8CFBC] rounded-md text-sm text-[#202A22] focus:outline-none focus:ring-1 focus:ring-[#35503F] focus:border-[#35503F] transition"
                />
              </div>
              <div>
                <label className="block text-xs tracking-[0.2em] uppercase text-[#9A9384] font-mono mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full px-4 py-3 border border-[#D8CFBC] rounded-md text-sm text-[#202A22] focus:outline-none focus:ring-1 focus:ring-[#35503F] focus:border-[#35503F] transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs tracking-[0.2em] uppercase text-[#9A9384] font-mono mb-3">
                Visibility
              </label>
              <div className="grid grid-cols-3 gap-3">
                {visibilityOptions.map(({ value, label, icon: Icon, description }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm({ ...form, visibility: value })}
                    className={`flex flex-col items-center gap-2 p-4 rounded-md border transition ${
                      form.visibility === value
                        ? "border-[#35503F] bg-[#E7DFCE]"
                        : "border-[#D8CFBC] hover:border-[#B8863B]"
                    }`}
                  >
                    <Icon size={20} className={form.visibility === value ? "text-[#35503F]" : "text-[#9A9384]"} />
                    <span className={`text-sm font-medium ${form.visibility === value ? "text-[#202A22]" : "text-[#6B6558]"}`}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#D8CFBC] rounded-md p-6">
            <div className="flex items-center justify-between mb-4">
              <label className="text-xs tracking-[0.2em] uppercase text-[#9A9384] font-mono">
                Add Existing Pins
              </label>
              <button
                type="button"
                onClick={() => setShowPinSelector(!showPinSelector)}
                className="text-sm text-[#35503F] hover:text-[#202A22] transition font-medium"
              >
                {showPinSelector ? "Close" : selectedPins.length > 0 ? `${selectedPins.length} selected` : "Select pins"}
              </button>
            </div>
            
            {showPinSelector && (
              <div className="max-h-64 overflow-y-auto space-y-2">
                {userPins.length === 0 ? (
                  <p className="text-sm text-[#9A9384] text-center py-4">No pins yet. Create some pins first!</p>
                ) : (
                  userPins.map((pin) => (
                    <label
                      key={pin._id}
                      className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition ${
                        selectedPins.includes(pin._id) ? "bg-[#E7DFCE]" : "hover:bg-[#F2ECE0]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPins.includes(pin._id)}
                        onChange={() => togglePinSelection(pin._id)}
                        className="w-4 h-4 rounded border-[#D8CFBC] text-[#35503F] focus:ring-[#35503F]"
                      />
                      <img src={pin.image} alt="" className="w-10 h-10 rounded object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#202A22] truncate">{pin.title}</p>
                        <p className="text-xs text-[#9A9384] truncate">{pin.location}</p>
                      </div>
                    </label>
                  ))
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#202A22] text-[#F2ECE0] rounded-md font-medium hover:bg-[#35503F] transition disabled:opacity-50 text-sm tracking-wide"
          >
            {loading ? "Creating..." : "Create Trip"}
          </button>
        </form>
      </div>
    </div>
  );
}
