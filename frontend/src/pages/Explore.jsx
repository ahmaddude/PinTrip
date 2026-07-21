import { useState, useEffect } from "react";
import api from "../utils/api";
import PinCard from "../components/PinCard";
import { Compass } from "lucide-react";

export default function Explore() {
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const fetchPins = async () => {
      try {
        const res = await api.get("/pin/pins", { signal: controller.signal });
        setPins(res.data.pins);
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
            Scouting locations
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F2ECE0] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10 pb-8 border-b border-[#D8CFBC]">
          <p className="text-xs tracking-[0.25em] uppercase text-[#B8863B] font-mono mb-3">
            Explorer · {pins.length.toString().padStart(2, "0")} entries
          </p>
          <h1
            className="text-4xl sm:text-5xl font-semibold text-[#202A22] leading-tight"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Explore
          </h1>
          <p className="text-[#6B6558] mt-3 max-w-md">
            Find inspiration for your next adventure.
          </p>
        </div>

        {pins.length === 0 ? (
          <div className="flex flex-col items-center text-center py-24 px-6 border border-dashed border-[#D8CFBC] rounded-sm">
            <Compass size={30} strokeWidth={1.5} className="text-[#35503F] mb-5" />
            <p
              className="text-2xl text-[#202A22]"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Nothing to explore yet
            </p>
            <p className="text-sm text-[#6B6558] mt-2 max-w-xs">
              Check back later for new pins from travelers.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pins.map((pin) => (
              <PinCard key={pin._id} pin={pin} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
