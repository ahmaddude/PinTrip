import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import api from "../utils/api";
import { createAvatarIcon } from "../components/MapMarker";

export default function MapPage() {
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const fetchPins = async () => {
      try {
        const res = await api.get("/pin/pins", { signal: controller.signal });
        const geoPins = res.data.pins.filter(
          (p) => p.coordinates?.lat && p.coordinates?.lng
        );
        setPins(geoPins);
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          console.error("Error fetching pins:", err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPins();
    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-[#D8CFBC]" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#35503F] animate-spin" />
          </div>
          <p className="text-xs tracking-[0.2em] uppercase text-[#6B6558] font-mono">
            Loading map
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F2ECE0] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-6 pb-6 border-b border-[#D8CFBC]">
          <p className="text-xs tracking-[0.25em] uppercase text-[#B8863B] font-mono mb-3">
            Cartography · {pins.length.toString().padStart(2, "0")} coordinates
          </p>
          <h1
            className="text-4xl sm:text-5xl font-semibold text-[#202A22] leading-tight"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Travel Map
          </h1>
        </div>

        <div className="bg-white border border-[#D8CFBC] rounded-md overflow-hidden" style={{ height: "calc(100vh - 14rem)" }}>
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
            {pins.map((pin) => (
              <Marker
                key={pin._id}
                position={[pin.coordinates.lat, pin.coordinates.lng]}
                icon={createAvatarIcon(pin.user?.avatar, 40)}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <img
                      src={pin.images?.[0]?.url}
                      alt={pin.title}
                      className="w-full h-28 object-cover"
                    />
                    <div className="p-3">
                      <h3
                        className="text-sm text-[#202A22]"
                        style={{ fontFamily: "'Fraunces', serif" }}
                      >
                        {pin.title}
                      </h3>
                      <p className="flex items-center gap-1 text-xs text-[#9A9384] mt-1 font-mono">
                        <MapPin size={10} className="text-[#B8863B]" /> {pin.location}
                      </p>
                      <Link
                        to={`/pin/${pin._id}`}
                        className="inline-block mt-2 text-xs text-[#35503F] font-medium hover:text-[#202A22] transition"
                      >
                        View details
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
