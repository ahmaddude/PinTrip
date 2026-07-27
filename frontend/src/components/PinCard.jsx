import { Link } from "react-router-dom";
import { Heart, MessageCircle, MapPin, ArrowUpRight, Users, Images } from "lucide-react";

export default function PinCard({ pin }) {
  const imageCount = pin.images?.length || 0;

  return (
    <Link
      to={`/pin/${pin._id}`}
      className="group block bg-white border border-[#D8CFBC] rounded-md overflow-hidden hover:border-[#B8863B]/60 hover:shadow-[0_8px_24px_-8px_rgba(32,42,34,0.25)] transition-all duration-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={pin.images?.[0]?.url}
          alt={pin.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out"
          loading="lazy"
          onError={(e) => {
            e.target.src = "";
            e.target.className = "w-full h-full bg-[#E7DFCE] flex items-center justify-center";
            e.target.alt = "Image unavailable";
          }}
        />

        {imageCount > 1 && (
          <div className="absolute top-3 left-3 bg-[#202A22]/70 text-[#F2ECE0] px-2 py-0.5 rounded-full flex items-center gap-1 text-xs font-mono">
            <Images size={12} />
            {imageCount}
          </div>
        )}

        <div className="absolute inset-0 bg-[#202A22]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
          <div className="bg-[#F2ECE0] p-2 rounded-full shadow-sm">
            <ArrowUpRight size={16} className="text-[#202A22]" />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <div className="flex items-center gap-4 text-[#F2ECE0]">
            <span className="flex items-center gap-1.5 text-sm font-medium">
              <Heart size={15} fill="currentColor" /> {pin.likes?.length || 0}
            </span>
            <span className="flex items-center gap-1.5 text-sm font-medium">
              <MessageCircle size={15} /> {pin.comments?.length || 0}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3
            className="text-[#202A22] truncate leading-snug text-lg"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            {pin.title}
          </h3>
          <span className="flex items-center gap-1 text-[#B0A891] flex-shrink-0 pt-1">
            <Heart size={13} />
            <span className="text-xs font-mono">{pin.likes?.length || 0}</span>
          </span>
        </div>

        {pin.location && (
          <p className="flex items-center gap-1.5 text-xs text-[#6B6558] mt-2 truncate font-mono tracking-wide">
            <MapPin size={12} className="text-[#B8863B] flex-shrink-0" />
            {pin.location}
          </p>
        )}

        {pin.taggedUsers && pin.taggedUsers.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            <Users size={12} className="text-[#35503F] flex-shrink-0" />
            <p className="text-xs text-[#6B6558] truncate">
              With {pin.taggedUsers.map((u) => u.name).join(", ")}
            </p>
          </div>
        )}

        {pin.user && (
          <Link
            to={`/profile/${pin.user._id}`}
            className="flex items-center gap-2.5 mt-4 pt-3 border-t border-[#EDE7D9] group/user"
            onClick={(e) => e.stopPropagation()}
          >
            {pin.user.avatar ? (
              <img
                src={pin.user.avatar}
                alt=""
                className="w-7 h-7 rounded-full object-cover ring-1 ring-[#D8CFBC]"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#35503F] text-[#F2ECE0] flex items-center justify-center text-[10px] font-semibold">
                {pin.user.name?.charAt(0)}
              </div>
            )}
            <span className="text-xs text-[#6B6558] group-hover/user:text-[#202A22] transition font-medium">
              {pin.user.name}
            </span>
          </Link>
        )}
      </div>
    </Link>
  );
}