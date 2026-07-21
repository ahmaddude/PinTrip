import { useState, useEffect } from "react";
import { Camera, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(user?.avatar || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => { if (preview && preview !== user?.avatar) URL.revokeObjectURL(preview); };
  }, [preview]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (preview && preview !== user?.avatar) URL.revokeObjectURL(preview);
      setAvatarFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("bio", bio);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }
      await updateProfile(formData);
      toast.success("Profile updated!");
      navigate(`/profile/${user._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F2ECE0] min-h-screen">
      <div className="max-w-lg mx-auto px-6 py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[#6B6558] hover:text-[#202A22] mb-8 text-sm transition font-medium"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <div className="mb-10 pb-8 border-b border-[#D8CFBC]">
          <p className="text-xs tracking-[0.25em] uppercase text-[#B8863B] font-mono mb-3">
            Settings
          </p>
          <h1
            className="text-4xl sm:text-5xl font-semibold text-[#202A22] leading-tight"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Edit Profile
          </h1>
        </div>

        <div className="bg-white border border-[#D8CFBC] rounded-md p-8">
          <div className="flex justify-center mb-8">
            <label className="relative cursor-pointer group">
              {preview ? (
                <img src={preview} alt="" className="w-24 h-24 rounded-full object-cover ring-2 ring-[#D8CFBC] group-hover:ring-[#B8863B]/60 transition" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#35503F] text-[#F2ECE0] flex items-center justify-center text-3xl font-semibold ring-2 ring-[#D8CFBC] group-hover:ring-[#B8863B]/60 transition">
                  {name?.charAt(0)}
                </div>
              )}
              <div className="absolute bottom-0 right-0 p-1.5 bg-[#202A22] text-[#F2ECE0] rounded-md shadow-sm">
                <Camera size={12} />
              </div>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs tracking-[0.2em] uppercase text-[#9A9384] font-mono mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-[#D8CFBC] rounded-md text-sm text-[#202A22] focus:outline-none focus:ring-1 focus:ring-[#35503F] focus:border-[#35503F] transition"
              />
            </div>
            <div>
              <label className="block text-xs tracking-[0.2em] uppercase text-[#9A9384] font-mono mb-2">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-[#D8CFBC] rounded-md text-sm text-[#202A22] focus:outline-none focus:ring-1 focus:ring-[#35503F] focus:border-[#35503F] transition resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#202A22] text-[#F2ECE0] rounded-md font-medium hover:bg-[#35503F] transition disabled:opacity-50 text-sm tracking-wide"
            >
              {loading ? "Saving..." : "Save changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
