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
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
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
      }
    } catch (error) {
      console.error("Error deleting strip:", error);
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

  const handleShare = () => {
    const profileUrl = window.location.href;
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getMemberSince = () => {
    if (!user?.metadata?.creationTime) return "Recently";
    const date = new Date(user.metadata.creationTime);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getLastActive = () => {
    if (!user?.metadata?.lastSignInTime) return "Recently";
    const date = new Date(user.metadata.lastSignInTime);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 5) return "Just now";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    return "Recently";
  };

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1 px-4 sm:px-8 lg:px-16 pb-12">
        <section className="flex flex-col items-center text-center pt-10 pb-8 border-b border-gray-200 bg-white mt-8 rounded-2xl shadow-sm">
          <div className="relative mb-4 group">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 blur-md opacity-75 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative bg-white rounded-full p-1">
              <img src={user.photoURL || "/default-avatarr.jpg"} alt="Profile" className="w-28 h-28 rounded-full object-cover border-4 border-white" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">{user.displayName || "User"}</h1>
          <p className="mt-1 text-sm text-gray-500">{user.email}</p>

          <div className="mt-4 flex gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span>📅</span>
              <span>Member since {getMemberSince()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🕐</span>
              <span>Active {getLastActive()}</span>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button onClick={() => setShowShareModal(true)} className="px-4 py-2 rounded-full border-2 border-gray-300 text-sm font-medium hover:bg-gray-50 transition-all hover:scale-105">
              🔗 Share Profile
            </button>
            <Link to="/edit-profile" className="px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-medium hover:shadow-lg transition-all hover:scale-105">
              Edit Profile
            </Link>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Your Photo Strips ({strips.length})</h2>
          
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="animate-pulse bg-gray-200 rounded-2xl h-48"></div>
              ))}
            </div>
          ) : strips.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-8xl mb-4">📷</div>
              <h3 className="text-xl font-bold mb-2">No Strips Yet!</h3>
              <p className="text-gray-500 mb-6">Create your first photo strip</p>
              <Link to="/booth" className="inline-block px-8 py-3 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold hover:shadow-xl transition-all hover:scale-105">
                Create Strip
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {strips.map((strip, i) => (
                <div key={strip.id} className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-2 p-2" style={{animation: `fade-in 0.5s ${i*50}ms backwards`}}>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center gap-2 z-10">
                    <button onClick={() => handleDownload(strip.public_url, strip.filename)} className="bg-white px-3 py-2 rounded-full text-xs font-bold hover:scale-110 transition">⬇️</button>
                    <button onClick={() => setSelectedStrip(strip)} className="bg-white px-3 py-2 rounded-full text-xs font-bold hover:scale-110 transition">👁️</button>
                    <button onClick={() => handleDelete(strip.storage_path)} className="bg-red-500 text-white px-3 py-2 rounded-full text-xs font-bold hover:scale-110 transition">🗑️</button>
                  </div>
                  <img src={strip.public_url} alt="Strip" className="w-full h-40 object-cover rounded-xl group-hover:scale-110 transition" />
                  <p className="text-xs text-gray-500 text-center mt-2">{new Date(strip.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />

      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowShareModal(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">Share Profile</h3>
            <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg mb-4">
              <input type="text" value={window.location.href} readOnly className="flex-1 bg-transparent text-sm outline-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleShare} className="flex-1 py-3 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold">{copied ? "✓ Copied!" : "Copy Link"}</button>
              <button onClick={() => setShowShareModal(false)} className="flex-1 py-3 rounded-full border-2 border-gray-300 font-bold">Close</button>
            </div>
          </div>
        </div>
      )}

      {selectedStrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setSelectedStrip(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <img src={selectedStrip.public_url} alt="Strip" className="rounded-xl max-h-[70vh] mx-auto" />
            <div className="flex gap-3 mt-4">
              <button onClick={() => handleDownload(selectedStrip.public_url, selectedStrip.filename)} className="flex-1 py-3 rounded-full bg-green-500 text-white font-bold">Download</button>
              <button onClick={() => handleDelete(selectedStrip.storage_path)} className="flex-1 py-3 rounded-full bg-red-500 text-white font-bold">Delete</button>
            </div>
            <button onClick={() => setSelectedStrip(null)} className="w-full py-3 rounded-full border-2 mt-3 font-bold">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
