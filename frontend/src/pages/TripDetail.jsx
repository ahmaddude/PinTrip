import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MapPin, Calendar, Trash2, ArrowLeft, Globe, Users, Lock, Pencil, Plus, X } from "lucide-react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import toast from "react-hot-toast";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import PinCard from "../components/PinCard";
import { confirmToast } from "../components/ConfirmToast";

function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      map.fitBounds(positions, { padding: [50, 50] });
    }
  }, [positions, map]);
  return null;
}

function createNumberIcon(number) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width: 28px;
      height: 28px;
      background: #35503F;
      color: #F2ECE0;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      font-family: 'Inter', sans-serif;
      border: 2px solid #F2ECE0;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    ">${number}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

const visibilityIcons = {
  public: Globe,
  friends: Users,
  private: Lock,
};

export default function TripDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    visibility: "public",
  });
  const [editCoverFile, setEditCoverFile] = useState(null);
  const [editCoverPreview, setEditCoverPreview] = useState(null);
  const [editSaving, setEditSaving] = useState(false);

  const [addPinOpen, setAddPinOpen] = useState(false);
  const [myPins, setMyPins] = useState([]);
  const [myPinsLoading, setMyPinsLoading] = useState(false);
  const [addingPinId, setAddingPinId] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchTrip(controller.signal);
    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    return () => { if (editCoverPreview) URL.revokeObjectURL(editCoverPreview); };
  }, [editCoverPreview]);

  const fetchTrip = async (signal) => {
    setLoading(true);
    try {
      const res = await api.get(`/trips/${id}`, { signal });
      setTrip(res.data.trip);
      setPins(res.data.pins || []);
    } catch (err) {
      if (err.name !== "CanceledError" && err.name !== "AbortError") {
        toast.error("Trip not found");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = () => {
    setEditForm({
      title: trip.title || "",
      description: trip.description || "",
      startDate: trip.startDate ? trip.startDate.slice(0, 10) : "",
      endDate: trip.endDate ? trip.endDate.slice(0, 10) : "",
      visibility: trip.visibility || "public",
    });
    setEditCoverFile(null);
    setEditCoverPreview(null);
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!editForm.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setEditSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", editForm.title);
      formData.append("description", editForm.description);
      formData.append("startDate", editForm.startDate || "");
      formData.append("endDate", editForm.endDate || "");
      formData.append("visibility", editForm.visibility);
      if (editCoverFile) formData.append("coverPhoto", editCoverFile);

      const res = await api.put(`/trips/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setTrip(res.data.trip);
      setEditOpen(false);
      toast.success("Trip updated");
    } catch {
      toast.error("Failed to update trip");
    } finally {
      setEditSaving(false);
    }
  };

  const openAddPinModal = async () => {
    setAddPinOpen(true);
    setMyPinsLoading(true);
    try {
      const res = await api.get("/pin/my-pins", { params: { limit: 100 } });
      const available = res.data.pins.filter((p) => p.trip !== id);
      setMyPins(available);
    } catch {
      toast.error("Failed to load your pins");
    } finally {
      setMyPinsLoading(false);
    }
  };

  const handleAddPin = async (pinId) => {
    setAddingPinId(pinId);
    try {
      const res = await api.patch(`/trips/${id}/add-pin`, { pinId });
      setPins((prev) => [...prev, res.data.pin]);
      setMyPins((prev) => prev.filter((p) => p._id !== pinId));
      toast.success("Pin added to trip");
    } catch {
      toast.error("Failed to add pin");
    } finally {
      setAddingPinId(null);
    }
  };

  const handleDelete = async () => {
    const ok = await confirmToast("Delete this trip? Pins will be kept as standalone pins.", { confirmLabel: "Delete" });
    if (!ok) return;
    try {
      await api.delete(`/trips/${id}`);
      toast.success("Trip deleted");
      navigate("/");
    } catch {
      toast.error("Failed to delete trip");
    }
  };

  const handleRemovePin = async (pinId) => {
    try {
      await api.patch(`/trips/pin/${pinId}/assign`, { tripId: null });
      setPins((prev) => prev.filter((p) => p._id !== pinId));
      toast.success("Pin removed from trip");
    } catch {
      toast.error("Failed to remove pin");
    }
  };

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-[#D8CFBC]" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#35503F] animate-spin" />
          </div>
          <p className="text-xs tracking-[0.2em] uppercase text-[#6B6558] font-mono">
            Loading trip
          </p>
        </div>
      </div>
    );
  }

  if (!trip) return null;

  const isOwner = user?._id === trip.user?._id;
  const VisibilityIcon = visibilityIcons[trip.visibility] || Globe;

  const pinsWithCoords = pins.filter(
    (pin) => pin.coordinates?.lat && pin.coordinates?.lng
  );

  const polylinePositions = pinsWithCoords.map((pin) => [
    pin.coordinates.lat,
    pin.coordinates.lng,
  ]);

  return (
    <div className="bg-[#F2ECE0] min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[#6B6558] hover:text-[#202A22] mb-8 text-sm transition font-medium"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <div className="bg-white border border-[#D8CFBC] rounded-md overflow-hidden mb-8">
          {trip.coverPhotoUrl && (
            <img
              src={trip.coverPhotoUrl}
              alt={trip.title}
              className="w-full h-64 object-cover"
            />
          )}
          <div className="p-6 md:p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <VisibilityIcon size={14} className="text-[#9A9384]" />
                  <span className="text-xs text-[#9A9384] font-mono uppercase tracking-wide">
                    {trip.visibility}
                  </span>
                </div>
                <h1
                  className="text-3xl text-[#202A22]"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  {trip.title}
                </h1>
              </div>
              {isOwner && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={openEditModal}
                    className="p-2 text-[#6B6558] hover:bg-[#E7DFCE] rounded-md transition"
                    title="Edit trip"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 text-[#A23B3B] hover:bg-[#F4E4DE] rounded-md transition"
                    title="Delete trip"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            {trip.description && (
              <p className="text-[#6B6558] text-sm leading-relaxed mb-4">
                {trip.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm text-[#9A9384]">
              {trip.startDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {formatDate(trip.startDate)}
                  {trip.endDate && ` - ${formatDate(trip.endDate)}`}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <MapPin size={14} />
                {pins.length} pin{pins.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {pinsWithCoords.length > 0 && (
          <div className="bg-white border border-[#D8CFBC] rounded-md overflow-hidden mb-8">
            <div className="p-4 border-b border-[#EDE7D9]">
              <h2
                className="text-lg text-[#202A22]"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Route Map
              </h2>
            </div>
            <div className="h-96">
              <MapContainer
                center={polylinePositions[0]}
                zoom={6}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FitBounds positions={polylinePositions} />
                {polylinePositions.length > 1 && (
                  <Polyline
                    positions={polylinePositions}
                    color="#35503F"
                    weight={3}
                    opacity={0.8}
                    dashArray="10, 10"
                  />
                )}
                {pinsWithCoords.map((pin, index) => (
                  <Marker
                    key={pin._id}
                    position={[pin.coordinates.lat, pin.coordinates.lng]}
                    icon={createNumberIcon(index + 1)}
                  >
                    <Popup>
                      <div className="text-center min-w-[120px]">
                        <img
                          src={pin.images?.[0]?.url}
                          alt={pin.title}
                          className="w-full h-20 object-cover rounded mb-1"
                        />
                        <p className="text-sm font-medium text-[#202A22]">{pin.title}</p>
                        <p className="text-xs text-[#9A9384]">{pin.location}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-lg text-[#202A22]"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Trip Pins
          </h2>
          {isOwner && (
            <button
              onClick={openAddPinModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#35503F] border border-[#35503F] rounded-md hover:bg-[#35503F] hover:text-[#F2ECE0] transition"
            >
              <Plus size={14} /> Add Pin
            </button>
          )}
        </div>

        {pins.length === 0 ? (
          <div className="flex flex-col items-center text-center py-20 border border-dashed border-[#D8CFBC] rounded-sm">
            <MapPin size={24} strokeWidth={1.5} className="text-[#B8863B] mb-3" />
            <p className="text-[#6B6558] text-sm">No pins in this trip yet</p>
            {isOwner && (
              <div className="flex gap-3 mt-4">
                <button
                  onClick={openAddPinModal}
                  className="text-sm text-[#35503F] hover:text-[#202A22] transition font-medium"
                >
                  Add existing pins
                </button>
                <span className="text-[#D8CFBC]">·</span>
                <Link
                  to="/create"
                  className="text-sm text-[#35503F] hover:text-[#202A22] transition font-medium"
                >
                  Create a new pin
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pins.map((pin, index) => (
              <div key={pin._id} className="relative">
                {isOwner && (
                  <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
                    <span className="bg-[#35503F] text-[#F2ECE0] text-xs font-bold px-2 py-1 rounded">
                      {index + 1}
                    </span>
                    <button
                      onClick={() => handleRemovePin(pin._id)}
                      className="bg-[#A23B3B] text-[#F2ECE0] p-1 rounded hover:bg-[#8A2F2F] transition"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
                <PinCard pin={pin} />
              </div>
            ))}
          </div>
        )}
      </div>

      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#202A22]/40 p-4">
          <div className="bg-white border border-[#D8CFBC] rounded-md w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-[#EDE7D9]">
              <h3
                className="text-lg text-[#202A22]"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Edit Trip
              </h3>
              <button onClick={() => setEditOpen(false)} className="p-1 text-[#9A9384] hover:text-[#202A22] transition">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs tracking-[0.2em] uppercase text-[#9A9384] font-mono mb-1.5">
                  Title *
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2.5 border border-[#D8CFBC] rounded-md text-sm text-[#202A22] focus:outline-none focus:ring-1 focus:ring-[#35503F] focus:border-[#35503F] transition placeholder:text-[#9A9384]"
                />
              </div>
              <div>
                <label className="block text-xs tracking-[0.2em] uppercase text-[#9A9384] font-mono mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2.5 border border-[#D8CFBC] rounded-md text-sm text-[#202A22] focus:outline-none focus:ring-1 focus:ring-[#35503F] focus:border-[#35503F] transition placeholder:text-[#9A9384] resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs tracking-[0.2em] uppercase text-[#9A9384] font-mono mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={editForm.startDate}
                    onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                    className="w-full px-3 py-2.5 border border-[#D8CFBC] rounded-md text-sm text-[#202A22] focus:outline-none focus:ring-1 focus:ring-[#35503F] focus:border-[#35503F] transition"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-[0.2em] uppercase text-[#9A9384] font-mono mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={editForm.endDate}
                    onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                    className="w-full px-3 py-2.5 border border-[#D8CFBC] rounded-md text-sm text-[#202A22] focus:outline-none focus:ring-1 focus:ring-[#35503F] focus:border-[#35503F] transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs tracking-[0.2em] uppercase text-[#9A9384] font-mono mb-1.5">
                  Visibility
                </label>
                <select
                  value={editForm.visibility}
                  onChange={(e) => setEditForm({ ...editForm, visibility: e.target.value })}
                  className="w-full px-3 py-2.5 border border-[#D8CFBC] rounded-md text-sm text-[#202A22] focus:outline-none focus:ring-1 focus:ring-[#35503F] focus:border-[#35503F] transition"
                >
                  <option value="public">Public</option>
                  <option value="friends">Friends</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div>
                <label className="block text-xs tracking-[0.2em] uppercase text-[#9A9384] font-mono mb-1.5">
                  Cover Photo
                </label>
                {editCoverPreview ? (
                  <div className="relative">
                    <img src={editCoverPreview} alt="" className="w-full h-40 object-cover rounded-md" />
                    <button
                      type="button"
                      onClick={() => { URL.revokeObjectURL(editCoverPreview); setEditCoverFile(null); setEditCoverPreview(null); }}
                      className="absolute top-2 right-2 p-1 bg-[#202A22] text-[#F2ECE0] rounded-md hover:bg-[#35503F] transition"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center h-24 border border-dashed border-[#D8CFBC] rounded-md cursor-pointer hover:border-[#B8863B] transition text-sm text-[#9A9384]">
                    Click to change cover
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files[0];
                        if (f) { setEditCoverFile(f); setEditCoverPreview(URL.createObjectURL(f)); }
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 p-5 border-t border-[#EDE7D9]">
              <button
                onClick={() => setEditOpen(false)}
                className="px-4 py-2 text-sm font-medium text-[#6B6558] bg-[#F2ECE0] border border-[#D8CFBC] rounded-md hover:bg-[#E7DFCE] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={editSaving}
                className="px-4 py-2 text-sm font-medium text-[#F2ECE0] bg-[#202A22] rounded-md hover:bg-[#35503F] transition disabled:opacity-50"
              >
                {editSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {addPinOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#202A22]/40 p-4">
          <div className="bg-white border border-[#D8CFBC] rounded-md w-full max-w-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-[#EDE7D9]">
              <h3
                className="text-lg text-[#202A22]"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Add Pin to Trip
              </h3>
              <button onClick={() => setAddPinOpen(false)} className="p-1 text-[#9A9384] hover:text-[#202A22] transition">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {myPinsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="relative w-8 h-8">
                    <div className="absolute inset-0 rounded-full border-2 border-[#D8CFBC]" />
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#35503F] animate-spin" />
                  </div>
                </div>
              ) : myPins.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-[#9A9384]">No available pins to add</p>
                  <Link
                    to="/create"
                    onClick={() => setAddPinOpen(false)}
                    className="inline-block mt-3 text-sm text-[#35503F] hover:text-[#202A22] font-medium transition"
                  >
                    Create a new pin
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {myPins.map((pin) => (
                    <div
                      key={pin._id}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-[#F2ECE0] transition"
                    >
                      <img
                        src={pin.images?.[0]?.url}
                        alt={pin.title}
                        className="w-14 h-14 rounded-md object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#202A22] truncate">{pin.title}</p>
                        <p className="text-xs text-[#9A9384] flex items-center gap-1 truncate">
                          <MapPin size={10} /> {pin.location}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAddPin(pin._id)}
                        disabled={addingPinId === pin._id}
                        className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-[#35503F] border border-[#35503F] rounded-md hover:bg-[#35503F] hover:text-[#F2ECE0] transition disabled:opacity-50"
                      >
                        {addingPinId === pin._id ? "Adding..." : "Add"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
