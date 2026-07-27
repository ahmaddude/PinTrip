import { Link } from "react-router-dom";
import { MapPin, Calendar } from "lucide-react";

export default function TripCard({ trip }) {
  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Link
      to={`/trip/${trip._id}`}
      className="group block bg-white border border-[#D8CFBC] rounded-md overflow-hidden hover:border-[#B8863B]/60 hover:shadow-[0_8px_24px_-8px_rgba(32,42,34,0.25)] transition-all duration-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {trip.coverPhotoUrl ? (
          <img
            src={trip.coverPhotoUrl}
            alt={trip.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-[#E7DFCE] flex items-center justify-center">
            <MapPin size={40} strokeWidth={1} className="text-[#B8863B]" />
          </div>
        )}

        <div className="absolute inset-0 bg-[#202A22]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-2 text-[#F2ECE0]">
            <MapPin size={14} />
            <span className="text-sm font-medium">
              {trip.pinCount || 0} pin{(trip.pinCount || 0) !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3
          className="text-[#202A22] truncate leading-snug text-lg"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          {trip.title}
        </h3>

        {trip.startDate && (
          <p className="flex items-center gap-1.5 text-xs text-[#6B6558] mt-2 font-mono tracking-wide">
            <Calendar size={12} className="text-[#B8863B] flex-shrink-0" />
            {formatDate(trip.startDate)}
            {trip.endDate && ` - ${formatDate(trip.endDate)}`}
          </p>
        )}

        {trip.description && (
          <p className="text-xs text-[#9A9384] mt-2 truncate">{trip.description}</p>
        )}
      </div>
    </Link>
  );
}
