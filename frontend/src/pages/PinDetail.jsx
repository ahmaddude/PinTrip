import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Heart, MessageCircle, MapPin, Trash2, Send, ArrowLeft, Users, ChevronLeft, ChevronRight, Route } from "lucide-react";
import toast from "react-hot-toast";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { confirmToast } from "../components/ConfirmToast";

export default function PinDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pin, setPin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const fetchPin = async () => {
      try {
        const res = await api.get(`/pin/${id}`, { signal: controller.signal });
        setPin(res.data.pin);
        setLoading(false);
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          toast.error("Pin not found");
          navigate("/");
        }
      }
    };
    fetchPin();
    return () => controller.abort();
  }, [id, navigate]);

  const handleLike = async () => {
    if (!user) return toast.error("Login to like");
    try {
      const res = await api.put(`/pin/like/${id}`);
      setPin(res.data.pin);
    } catch {
      toast.error("Failed to like");
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !user) return;
    setCommentLoading(true);
    try {
      const res = await api.put(`/pin/comment/${id}`, { comment });
      setPin(res.data.pin);
      setComment("");
    } catch {
      toast.error("Failed to comment");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDelete = async () => {
    const ok = await confirmToast("Delete this pin?", { confirmLabel: "Delete" });
    if (!ok) return;
    try {
      await api.delete(`/pin/delete/${id}`);
      toast.success("Pin deleted");
      navigate("/");
    } catch {
      toast.error("Failed to delete");
    }
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
            Reading the entry
          </p>
        </div>
      </div>
    );
  }

  if (!pin) return null;

  const isLiked = pin.likes?.some((l) => l._id === user?._id);
  const isOwner = pin.user?._id === user?._id;
  const images = pin.images || [];
  const imageCount = images.length;

  return (
    <div className="bg-[#F2ECE0] min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[#6B6558] hover:text-[#202A22] mb-8 text-sm transition font-medium"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <div className="bg-white border border-[#D8CFBC] rounded-md overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2 relative">
              {imageCount > 0 && (
                <img src={images[imageIndex]?.url} alt={pin.title} className="w-full h-80 md:h-full object-cover" />
              )}
              {imageCount > 1 && (
                <>
                  <button
                    onClick={() => setImageIndex((imageIndex - 1 + imageCount) % imageCount)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#202A22]/70 text-[#F2ECE0] rounded-full hover:bg-[#202A22] transition"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setImageIndex((imageIndex + 1) % imageCount)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#202A22]/70 text-[#F2ECE0] rounded-full hover:bg-[#202A22] transition"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <span className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-[#202A22]/70 text-[#F2ECE0] text-xs rounded-full font-mono">
                    {imageIndex + 1} / {imageCount}
                  </span>
                </>
              )}
              {imageCount > 1 && (
                <div className="absolute bottom-0 left-0 right-0 flex gap-1.5 p-2 bg-gradient-to-t from-[#202A22]/50 to-transparent">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setImageIndex(i)}
                      className={`w-12 h-12 rounded-md overflow-hidden border-2 flex-shrink-0 transition ${
                        i === imageIndex ? "border-[#F2ECE0]" : "border-transparent opacity-70"
                      }`}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="md:w-1/2 p-6 md:p-8 flex flex-col">
              <div className="flex items-center justify-between mb-5 pb-5 border-b border-[#EDE7D9]">
                <Link to={`/profile/${pin.user?._id}`} className="flex items-center gap-3 group">
                  {pin.user?.avatar ? (
                    <img src={pin.user.avatar} alt="" className="w-10 h-10 rounded-full object-cover ring-1 ring-[#D8CFBC]" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#35503F] text-[#F2ECE0] flex items-center justify-center text-sm font-semibold">
                      {pin.user?.name?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-sm text-[#202A22] group-hover:text-[#35503F] transition">{pin.user?.name}</p>
                    {pin.location && (
                      <p className="flex items-center gap-1 text-xs text-[#9A9384] font-mono">
                        <MapPin size={10} className="text-[#B8863B]" /> {pin.location}
                      </p>
                    )}
                  </div>
                </Link>
                {isOwner && (
                  <button onClick={handleDelete} className="p-2 text-[#A23B3B] hover:bg-[#F4E4DE] rounded-md transition">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <h2
                className="text-2xl text-[#202A22] mb-2"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                {pin.title}
              </h2>
              {pin.description && (
                <p className="text-[#6B6558] text-sm leading-relaxed mb-5">{pin.description}</p>
              )}

              {pin.taggedUsers && pin.taggedUsers.length > 0 && (
                <div className="flex items-center gap-2 mb-5">
                  <Users size={14} className="text-[#35503F]" />
                  <div className="flex flex-wrap gap-2">
                    {pin.taggedUsers.map((taggedUser) => (
                      <Link
                        key={taggedUser._id}
                        to={`/profile/${taggedUser._id}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#E7DFCE] text-[#202A22] rounded-full text-xs font-medium hover:bg-[#D8CFBC] transition"
                      >
                        {taggedUser.avatar ? (
                          <img src={taggedUser.avatar} alt="" className="w-4 h-4 rounded-full object-cover" />
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-[#35503F] text-[#F2ECE0] flex items-center justify-center text-[8px] font-semibold">
                            {taggedUser.name?.charAt(0)}
                          </div>
                        )}
                        @{taggedUser.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {pin.trip && (
                <div className="flex items-center justify-between px-4 py-3 bg-[#35503F]/5 border border-[#35503F]/15 rounded-md mb-5">
                  <div className="flex items-center gap-2.5">
                    <Route size={14} className="text-[#35503F]" />
                    <p className="text-sm text-[#6B6558]">
                      Part of trip <span className="font-medium text-[#202A22]">{pin.trip.title}</span>
                    </p>
                  </div>
                  <Link
                    to={`/trip/${pin.trip._id}`}
                    className="text-xs font-medium text-[#35503F] hover:text-[#202A22] px-3 py-1.5 rounded-md bg-[#35503F]/10 hover:bg-[#35503F]/20 transition"
                  >
                    View trip
                  </Link>
                </div>
              )}

              <div className="flex items-center gap-3 mb-5">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition border ${
                    isLiked
                      ? "bg-[#F4E4DE] text-[#A23B3B] border-[#A23B3B]/20"
                      : "bg-[#F2ECE0] text-[#6B6558] border-[#D8CFBC] hover:text-[#A23B3B]"
                  }`}
                >
                  <Heart size={14} fill={isLiked ? "currentColor" : "none"} /> {pin.likes?.length || 0}
                </button>
                <span className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium bg-[#F2ECE0] text-[#6B6558] border border-[#D8CFBC]">
                  <MessageCircle size={14} /> {pin.comments?.length || 0}
                </span>
              </div>

              <div className="border-t border-[#EDE7D9] pt-4 flex-1 overflow-y-auto max-h-52 space-y-3 mb-4">
                {pin.comments?.length === 0 && (
                  <p className="text-[#9A9384] text-sm text-center py-4">No comments yet</p>
                )}
                {pin.comments?.map((c) => (
                  <div key={c._id} className="flex gap-2.5">
                    {c.user?.avatar ? (
                      <img src={c.user.avatar} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#35503F] text-[#F2ECE0] flex items-center justify-center text-[10px] font-semibold flex-shrink-0">
                        {c.user?.name?.charAt(0)}
                      </div>
                    )}
                    <div className="bg-[#F2ECE0] rounded-md px-3 py-2 flex-1 border border-[#EDE7D9]">
                      <span className="text-xs font-medium text-[#202A22]">{c.user?.name}</span>
                      <p className="text-sm text-[#6B6558] mt-0.5">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {user && (
                <form onSubmit={handleComment} className="flex gap-2 mt-auto">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 px-4 py-2.5 border border-[#D8CFBC] rounded-md text-sm text-[#202A22] focus:outline-none focus:ring-1 focus:ring-[#35503F] focus:border-[#35503F] transition placeholder:text-[#9A9384]"
                  />
                  <button
                    type="submit"
                    disabled={commentLoading || !comment.trim()}
                    className="p-2.5 bg-[#202A22] text-[#F2ECE0] rounded-md hover:bg-[#35503F] disabled:opacity-40 transition"
                  >
                    <Send size={14} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
