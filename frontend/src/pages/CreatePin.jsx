import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, MapPin, X, Crosshair } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import toast from "react-hot-toast";
import api from "../utils/api";
import { defaultPinIcon } from "../components/MapMarker";
import MentionAutocomplete from "../components/MentionAutocomplete";

function LocationMarker({ position, onPositionChange }) {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng);
    },
  });

  return position ? <Marker position={position} icon={defaultPinIcon} /> : null;
}

export default function CreatePin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
  });
  const [position, setPosition] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [taggedUsers, setTaggedUsers] = useState([]);

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  const handleMapClick = useCallback(async (latlng) => {
    setPosition(latlng);
    setForm((prev) => ({
      ...prev,
      lat: latlng.lat.toFixed(6),
      lng: latlng.lng.toFixed(6),
    }));
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`
      );
      const data = await res.json();
      if (data.address) {
        const a = data.address;
        const parts = [a.city, a.town, a.village, a.county, a.state, a.country].filter(Boolean);
        setForm((prev) => ({ ...prev, location: parts.slice(0, 3).join(", ") }));
      }
    } catch {
      // reverse geocoding failed
    }
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select an image");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("location", form.location);
      if (form.lat) formData.append("lat", form.lat);
      if (form.lng) formData.append("lng", form.lng);
      if (taggedUsers.length > 0) {
        formData.append("taggedUserIds", JSON.stringify(taggedUsers.map((u) => u._id)));
      }

      await api.post("/pin/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Pin created!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create pin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F2ECE0] min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-10 pb-8 border-b border-[#D8CFBC]">
          <p className="text-xs tracking-[0.25em] uppercase text-[#B8863B] font-mono mb-3">
            New Entry
          </p>
          <h1
            className="text-4xl sm:text-5xl font-semibold text-[#202A22] leading-tight"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Create a Pin
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white border border-[#D8CFBC] rounded-md p-6">
            <label className="block text-xs tracking-[0.2em] uppercase text-[#9A9384] font-mono mb-3">
              Image
            </label>
            {preview ? (
              <div className="relative">
                <img src={preview} alt="" className="w-full max-h-96 object-cover rounded-md" />
                <button
                  type="button"
                  onClick={() => { URL.revokeObjectURL(preview); setFile(null); setPreview(null); }}
                  className="absolute top-2 right-2 p-1.5 bg-[#202A22] text-[#F2ECE0] rounded-md hover:bg-[#35503F] transition"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-56 border border-dashed border-[#D8CFBC] rounded-md cursor-pointer hover:border-[#B8863B] transition">
                <Upload size={32} strokeWidth={1.5} className="text-[#9A9384] mb-2" />
                <span className="text-sm text-[#6B6558]">Click to upload an image</span>
                <span className="text-xs text-[#9A9384] mt-1">JPG, PNG or WEBP</span>
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
                placeholder="Amazing beach sunset"
              />
            </div>
            <div>
              <label className="block text-xs tracking-[0.2em] uppercase text-[#9A9384] font-mono mb-2">
                Description
              </label>
              <MentionAutocomplete
                text={form.description}
                onTextChange={(value) => setForm({ ...form, description: value })}
                onTaggedUsersChange={setTaggedUsers}
              />
            </div>
            <div>
              <label className="block text-xs tracking-[0.2em] uppercase text-[#9A9384] font-mono mb-2">
                <span className="flex items-center gap-1"><MapPin size={12} className="text-[#B8863B]" /> Location name *</span>
              </label>
              <input
                type="text"
                required
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full px-4 py-3 border border-[#D8CFBC] rounded-md text-sm text-[#202A22] focus:outline-none focus:ring-1 focus:ring-[#35503F] focus:border-[#35503F] transition placeholder:text-[#9A9384]"
                placeholder="Bali, Indonesia"
              />
            </div>
          </div>

          <div className="bg-white border border-[#D8CFBC] rounded-md p-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs tracking-[0.2em] uppercase text-[#9A9384] font-mono flex items-center gap-1.5">
                <Crosshair size={12} className="text-[#B8863B]" /> Drop a pin
              </label>
              {position && (
                <span className="text-xs text-[#9A9384] font-mono">
                  {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
                </span>
              )}
            </div>
            <p className="text-xs text-[#9A9384] mb-3">Click anywhere on the map to mark the location</p>
            <div className="rounded-md overflow-hidden border border-[#D8CFBC]" style={{ height: "300px" }}>
              <MapContainer
                center={[20, 0]}
                zoom={2}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={position} onPositionChange={handleMapClick} />
              </MapContainer>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#202A22] text-[#F2ECE0] rounded-md font-medium hover:bg-[#35503F] transition disabled:opacity-50 text-sm tracking-wide"
          >
            {loading ? "Creating..." : "Create Pin"}
          </button>
        </form>
      </div>
    </div>
  );
}
