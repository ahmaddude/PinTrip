import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MapPin, Calendar, Trash2, ArrowLeft, Globe, Users, Lock, GripVertical } from "lucide-react";
import { MapContainer, TileLayer, Polyline, useMap } from "react-leaflet";
import toast from "react-hot-toast";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import PinCard from "../components/PinCard";
import { defaultPinIcon } from "../components/MapMarker";

function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      map.fitBounds(positions, { padding: [50, 50] });
    }
  }, [positions, map]);
  return null;
}

function TripMarker({ position, index }) {
  return null;
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
  const [activePin, setActivePin] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchTrip(controller.signal);
    return () => controller.abort();
  }, [id]);

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

  const handleDelete = async () => {
    if (!confirm("Delete this trip? Pins will be kept as standalone pins.")) return;
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
                <button
                  onClick={handleDelete}
                  className="p-2 text-[#A23B3B] hover:bg-[#F4E4DE] rounded-md transition"
                >
                  <Trash2 size={16} />
                </button>
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

        {polylinePositions.length > 1 && (
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
                <Polyline
                  positions={polylinePositions}
                  color="#35503F"
                  weight={3}
                  opacity={0.8}
                  dashArray="10, 10"
                />
                {pinsWithCoords.map((pin, index) => (
                  <div key={pin._id}>
                    <div
                      className="absolute z-[1000] w-6 h-6 -ml-3 -mt-3 bg-[#35503F] text-[#F2ECE0] rounded-full flex items-center justify-center text-xs font-bold cursor-pointer hover:bg-[#202A22] transition"
                      style={{
                        left: `${50}%`,
                        top: `${50}%`,
                      }}
                      onClick={() => setActivePin(pin)}
                    >
                      {index + 1}
                    </div>
                  </div>
                ))}
              </MapContainer>
            </div>
          </div>
        )}

        <div className="mb-6">
          <h2
            className="text-lg text-[#202A22] mb-4"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Trip Pins
          </h2>
        </div>

        {pins.length === 0 ? (
          <div className="flex flex-col items-center text-center py-20 border border-dashed border-[#D8CFBC] rounded-sm">
            <MapPin size={24} strokeWidth={1.5} className="text-[#B8863B] mb-3" />
            <p className="text-[#6B6558] text-sm">No pins in this trip yet</p>
            {isOwner && (
              <Link
                to="/create"
                className="mt-4 text-sm text-[#35503F] hover:text-[#202A22] transition font-medium"
              >
                Create a pin
              </Link>
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
    </div>
  );
}
