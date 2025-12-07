import { useState, useEffect } from "react";
import { auth } from "../firebaseConfig";
import Header from "../components/header";
import Footer from "../components/footer";
import { Link, useNavigate } from "react-router-dom";

type Strip = {
  id: number;
  user_id: string;
  filename: string;
  storage_path: string;
  public_url: string;
  created_at: string;
};

export default function ProfilePage() {
  const [selectedStrip, setSelectedStrip] = useState<Strip | null>(null);
  const [strips, setStrips] = useState<Strip[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((fbUser) => {
      if (!fbUser) {
        navigate("/login");
      } else {
        setUser(fbUser);
        fetchUserStrips(fbUser.uid);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchUserStrips = async (userId: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/storage/user/${userId}/strips`
      );
      const data = await response.json();
      setStrips(data.items || []);
    } catch (error) {
      console.error("Error fetching strips:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (storagePath: string) => {
    if (!confirm("Are you sure you want to delete this strip?")) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/storage/${encodeURIComponent(storagePath)}`,
        { method: "DELETE" }
      );
      const data = await response.json();
      
      if (data.success) {
        setStrips(strips.filter((s) => s.storage_path !== storagePath));
        setSelectedStrip(null);
        alert("Strip deleted successfully!");
      } else {
        alert("Failed to delete strip");
      }
    } catch (error) {
      console.error("Error deleting strip:", error);
      alert("Failed to delete strip");
    }
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 px-4 sm:px-8 lg:px-16 pb-12">
        <section className="flex flex-col items-center text-center pt-10 pb-8 border-b border-gray-200">
          <img
            src={user.photoURL || "/default-avatarr.jpg"}
            alt="Profile avatar"
            className="w-28 h-28 rounded-full object-cover border-4 border-orange-400 shadow-md"
          />

          <h1 className="mt-4 text-3xl sm:text-4xl font-black">
            {user.displayName || "User"}
          </h1>

          <p className="mt-1 text-sm sm:text-base text-gray-500">
            {user.email}
          </p>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              className="px-4 py-2 rounded-full border border-gray-300 text-sm font-medium hover:bg-gray-100"
              onClick={() => alert("Share feature coming soon!")}
            >
              Share Profile
            </button>

            <Link
              to="/edit-profile"
              className="px-4 py-2 rounded-full bg-[#e15c31] text-white text-sm font-medium hover:bg-[#ff9573]"
            >
              Edit Profile
            </Link>
          </div>
        </section>

        <section className="mt-4 flex justify-center">
          <div className="inline-flex gap-6 border-b border-gray-200">
            <button
              type="button"
              className="pb-2 text-sm sm:text-base font-medium text-black border-b-2 border-black"
            >
              My Strips ({strips.length})
            </button>
          </div>
        </section>

        <section className="mt-8">
          {loading ? (
            <p className="text-center text-gray-500">Loading your strips...</p>
          ) : strips.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">You haven't created any photo strips yet!</p>
              <Link
                to="/booth"
                className="inline-block px-6 py-3 rounded-full bg-[#e15c31] text-white font-medium hover:bg-[#ff9573]"
              >
                Create Your First Strip
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {strips.map((strip) => (
                <div
                  key={strip.id}
                  onClick={() => setSelectedStrip(strip)}
                  className="bg-white shadow-md rounded-2xl border border-gray-200 hover:shadow-xl hover:-translate-y-0.5 transition p-2 cursor-pointer"
                >
                  <div className="w-full h-40 overflow-hidden rounded-xl bg-gray-50">
                    <img
                      src={strip.public_url}
                      alt="Strip preview"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500 text-center">
                    {new Date(strip.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />

      {selectedStrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-xs w-full space-y-3">
            <div className="max-h-[70vh] overflow-auto flex justify-center">
              <img
                src={selectedStrip.public_url}
                alt="Full strip"
                className="rounded-lg max-h-[70vh] w-auto mx-auto object-contain"
              />
            </div>

            <div className="flex gap-3 mt-2">
              <button
                onClick={() => handleDownload(selectedStrip.public_url, selectedStrip.filename)}
                className="flex-1 py-2 rounded-full bg-[#e15c31] text-white text-sm font-medium hover:bg-[#ff9573]"
              >
                Download
              </button>

              <button
                type="button"
                className="flex-1 py-2 rounded-full border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100"
                onClick={() => handleDelete(selectedStrip.storage_path)}
              >
                Delete
              </button>
            </div>

            <button
              type="button"
              className="w-full mt-1 text-sm text-gray-500 underline"
              onClick={() => setSelectedStrip(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
