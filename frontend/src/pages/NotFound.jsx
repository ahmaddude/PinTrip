import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2ECE0] px-4">
      <div className="text-center">
        <p
          className="text-7xl font-semibold text-[#202A22] mb-4"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          404
        </p>
        <p className="text-[#6B6558] mb-8">
          This page doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-[#202A22] text-[#F2ECE0] px-6 py-3 text-sm font-medium tracking-wide hover:bg-[#35503F] transition rounded-md"
        >
          <MapPin size={15} /> Back to home
        </Link>
      </div>
    </div>
  );
}
