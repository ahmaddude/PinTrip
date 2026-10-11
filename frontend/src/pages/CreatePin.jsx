import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, MapPin, X, Crosshair, ChevronLeft, ChevronRight } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import toast from "react-hot-toast";
import api from "../utils/api";
import { CARTO_VOYAGER_TILE_URL } from "../utils/mapTiles";
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
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [previewIndex, setPreviewIndex] = useState(0);

  useEffect(() => {
    return () => { previews.forEach(p => URL.revokeObjectURL(p)); };
  }, [previews]);

  const handleMapClick = useCallback(async (latlng) => {
    setPosition(latlng);
    setForm((prev) => ({
      ...prev,
      lat: latlng.lat.toFixed(6),
      lng: latlng.lng.toFixed(6),
    }));
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&accept-language=en`
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
    const selected = Array.from(e.target.files);
    if (selected.length === 0) return;

    const newPreviews = selected.map(f => URL.createObjectURL(f));
    setFiles(prev => [...prev, ...selected]);
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeFile = (index) => {
    URL.revokeObjectURL(previews[index]);
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    if (previewIndex >= previews.length - 1 && previewIndex > 0) {
      setPreviewIndex(previewIndex - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      toast.error("Please select at least one image");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      files.forEach(f => formData.append("images", f));
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
              Images ({files.length})
            </label>
            {previews.length > 0 ? (
              <div className="space-y-3">
                <div className="relative">
                  <img src={previews[previewIndex]} alt="" className="w-full max-h-96 object-cover rounded-md" />
                  <button
                    type="button"
                    onClick={() => removeFile(previewIndex)}
                    className="absolute top-2 right-2 p-1.5 bg-[#202A22] text-[#F2ECE0] rounded-md hover:bg-[#35503F] transition"
                  >
                    <X size={14} />
                  </button>
                  {files.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setPreviewIndex((previewIndex - 1 + files.length) % files.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#202A22]/70 text-[#F2ECE0] rounded-full hover:bg-[#202A22] transition"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewIndex((previewIndex + 1) % files.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#202A22]/70 text-[#F2ECE0] rounded-full hover:bg-[#202A22] transition"
                      >
                        <ChevronRight size={16} />
                      </button>
                      <span className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#202A22]/70 text-[#F2ECE0] text-xs rounded-full font-mono">
                        {previewIndex + 1} / {files.length}
                      </span>
                    </>
                  )}
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {previews.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPreviewIndex(i)}
                      className={`relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition ${
                        i === previewIndex ? "border-[#35503F]" : "border-[#D8CFBC]"
                      }`}
                    >
                      <img src={p} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                  <label className="flex-shrink-0 w-16 h-16 rounded-md border border-dashed border-[#D8CFBC] flex items-center justify-center cursor-pointer hover:border-[#B8863B] transition">
                    <Upload size={16} className="text-[#9A9384]" />
                    <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
                {files.length < 10 && (
                  <label className="flex items-center justify-center gap-2 w-full py-2.5 border border-dashed border-[#D8CFBC] rounded-md text-sm text-[#6B6558] hover:border-[#B8863B] hover:text-[#B8863B] cursor-pointer transition">
                    <Upload size={14} />
                    Add more pictures
                    <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                  </label>
                )}
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-56 border border-dashed border-[#D8CFBC] rounded-md cursor-pointer hover:border-[#B8863B] transition">
                <Upload size={32} strokeWidth={1.5} className="text-[#9A9384] mb-2" />
                <span className="text-sm text-[#6B6558]">Click to upload images</span>
                <span className="text-xs text-[#9A9384] mt-1">Up to 10 · JPG, PNG or WEBP</span>
                <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
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
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
                  url={CARTO_VOYAGER_TILE_URL}
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
