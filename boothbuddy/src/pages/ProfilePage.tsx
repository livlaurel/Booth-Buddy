import React, { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

type UserProfile = {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
};

type PhotoStrip = {
  id: string;
  user_id: string;
  photos: string[];
  filter_type: string;
  created_at: string;
  is_favorite?: boolean;
};

type GridSize = "small" | "medium" | "large";
type ActiveTab = "strips" | "favorites" | "settings";

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoStrips, setPhotoStrips] = useState<PhotoStrip[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [selectedStrip, setSelectedStrip] = useState<PhotoStrip | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [gridSize, setGridSize] = useState<GridSize>("medium");
  const [activeTab, setActiveTab] = useState<ActiveTab>("strips");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [hoveredStrip, setHoveredStrip] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((fbUser) => {
      if (!fbUser) {
        setUser(null);
        setLoading(false);
      } else {
        setUser({
          displayName: fbUser.displayName,
          email: fbUser.email,
          photoURL: fbUser.photoURL,
        });
        setLoading(false);
        fetchUserPhotos(fbUser.uid);
        loadFavorites(fbUser.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadFavorites = (userId: string) => {
    const stored = localStorage.getItem(`favorites_${userId}`);
    if (stored) {
      setFavorites(new Set(JSON.parse(stored)));
    }
  };

  const saveFavorites = (userId: string, favs: Set<string>) => {
    localStorage.setItem(`favorites_${userId}`, JSON.stringify([...favs]));
  };

  const toggleFavorite = (stripId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(stripId)) {
      newFavorites.delete(stripId);
    } else {
      newFavorites.add(stripId);
    }
    setFavorites(newFavorites);
    if (user) {
      saveFavorites((user as any).uid, newFavorites);
    }
  };

  const fetchUserPhotos = async (userId: string) => {
    setLoadingPhotos(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/photos/user/${userId}`
      );
      const data = await response.json();
      if (data.success) {
        setPhotoStrips(data.photoStrips);
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleDeleteStrip = async (stripId: string) => {
    if (!confirm("Are you sure you want to delete this photo strip?")) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/photos/${stripId}`,
        { method: "DELETE" }
      );
      const data = await response.json();
      if (data.success) {
        setPhotoStrips(photoStrips.filter((strip) => strip.id !== stripId));
        setSelectedStrip(null);
        alert("Strip deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting photo strip:", error);
    }
  };

  const downloadStrip = (photos: string[], stripId: string) => {
    const canvas = document.createElement("canvas");
    const width = 200;
    const height = 280;
    canvas.width = width;
    canvas.height = height * photos.length;
    const ctx = canvas.getContext("2d")!;

    let loaded = 0;
    photos.forEach((photo, i) => {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, i * height, width, height);
        loaded++;
        if (loaded === photos.length) {
          const link = document.createElement("a");
          link.download = `photo-strip-${stripId}.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();
        }
      };
      img.src = photo;
    });
  };

  const handleShare = () => {
    const profileUrl = window.location.href;
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getGridCols = () => {
    switch (gridSize) {
      case "small": return "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6";
      case "medium": return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5";
      case "large": return "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
    }
  };

  const displayedStrips = activeTab === "favorites" 
    ? photoStrips.filter(strip => favorites.has(strip.id))
    : photoStrips;

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-white">
        <p className="text-lg">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-white">
        <h1 className="text-3xl font-bold mb-4">Profile</h1>
        <p>You are not logged in.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white p-4">
      <div className="max-w-6xl mx-auto w-full mt-8">
        {/* Profile Header */}
        <div className="bg-white border-4 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 mb-8">
          <h1 className="text-3xl font-bold mb-6 text-center">Your Profile</h1>

          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar with Bold Border */}
            <div className="relative flex-shrink-0">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-black" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-black flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            <div className="flex-grow w-full space-y-4">
              <div className="bg-gray-50 border-2 border-black rounded p-4">
                <p className="text-sm font-semibold text-gray-600 mb-1">NAME</p>
                <p className="text-lg font-bold">{user.displayName || "Unnamed user"}</p>
              </div>
              <div className="bg-gray-50 border-2 border-black rounded p-4">
                <p className="text-sm font-semibold text-gray-600 mb-1">EMAIL</p>
                <p className="text-lg font-bold break-all">{user.email}</p>
              </div>
            </div>

            <div className="flex flex-col space-y-3 flex-shrink-0">
              <button
                onClick={() => setShowShareModal(true)}
                className="bg-white text-black font-bold py-3 px-6 border-4 border-black rounded hover:bg-gray-100 transition-colors whitespace-nowrap"
              >
                Share Profile
              </button>
              
              <button
                onClick={() => navigate("/booth")}
                className="bg-white text-black font-bold py-3 px-6 border-4 border-black rounded hover:bg-gray-100 transition-colors whitespace-nowrap"
              >
                Go to Photo Booth
              </button>

              <button
                onClick={handleSignOut}
                className="bg-orange-500 text-white font-bold py-3 px-6 border-4 border-black rounded hover:bg-orange-600 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] whitespace-nowrap"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Tabs and Controls */}
        <div className="bg-white border-4 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
          <div className="flex justify-between items-center mb-6">
            {/* Tabs */}
            <div className="flex gap-2 border-4 border-black rounded-lg overflow-hidden">
              <button
                onClick={() => setActiveTab("strips")}
                className={`px-6 py-3 font-bold transition-colors ${
                  activeTab === "strips" 
                    ? "bg-black text-white" 
                    : "bg-white text-black hover:bg-gray-100"
                }`}
              >
                My Strips ({photoStrips.length})
              </button>
              <button
                onClick={() => setActiveTab("favorites")}
                className={`px-6 py-3 font-bold transition-colors border-l-4 border-black ${
                  activeTab === "favorites" 
                    ? "bg-black text-white" 
                    : "bg-white text-black hover:bg-gray-100"
                }`}
              >
                Favorites ({favorites.size})
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`px-6 py-3 font-bold transition-colors border-l-4 border-black ${
                  activeTab === "settings" 
                    ? "bg-black text-white" 
                    : "bg-white text-black hover:bg-gray-100"
                }`}
              >
                Settings
              </button>
            </div>

            {/* Grid Size Toggle */}
            {activeTab !== "settings" && (
              <div className="flex gap-2 border-4 border-black rounded-lg overflow-hidden">
                <button
                  onClick={() => setGridSize("small")}
                  className={`px-4 py-2 font-bold transition-colors ${
                    gridSize === "small" 
                      ? "bg-black text-white" 
                      : "bg-white text-black hover:bg-gray-100"
                  }`}
                  title="Small"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="13" y="3" width="7" height="7" />
                    <rect x="3" y="13" width="7" height="7" />
                    <rect x="13" y="13" width="7" height="7" />
                  </svg>
                </button>
                <button
                  onClick={() => setGridSize("medium")}
                  className={`px-4 py-2 font-bold transition-colors border-l-4 border-black ${
                    gridSize === "medium" 
                      ? "bg-black text-white" 
                      : "bg-white text-black hover:bg-gray-100"
                  }`}
                  title="Medium"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="8" height="8" />
                    <rect x="13" y="3" width="8" height="8" />
                    <rect x="3" y="13" width="8" height="8" />
                  </svg>
                </button>
                <button
                  onClick={() => setGridSize("large")}
                  className={`px-4 py-2 font-bold transition-colors border-l-4 border-black ${
                    gridSize === "large" 
                      ? "bg-black text-white" 
                      : "bg-white text-black hover:bg-gray-100"
                  }`}
                  title="Large"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="8" height="8" />
                    <rect x="13" y="3" width="8" height="8" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Content Area */}
          {activeTab === "settings" ? (
            <div className="py-8 text-center">
              <p className="text-gray-600 mb-4">Settings page coming soon!</p>
            </div>
          ) : loadingPhotos ? (
            <div className={`grid ${getGridCols()} gap-6`}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg border-4 border-gray-300 p-3">
                    <div className="space-y-2 mb-3">
                      {[1, 2, 3, 4].map((j) => (
                        <div key={j} className="bg-gray-300 h-16 rounded"></div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : displayedStrips.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📷</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                {activeTab === "favorites" ? "No Favorite Strips Yet!" : "No Photo Strips Yet!"}
              </h3>
              <p className="text-gray-500 mb-6">
                {activeTab === "favorites" 
                  ? "Star your favorite strips to see them here" 
                  : "Create your first photo strip and start building your collection"}
              </p>
              {activeTab === "strips" && (
                <button
                  onClick={() => navigate("/booth")}
                  className="px-8 py-3 rounded bg-orange-500 text-white font-bold hover:bg-orange-600 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors"
                >
                  Create Your First Strip
                </button>
              )}
            </div>
          ) : (
            <div className={`grid ${getGridCols()} gap-6`}>
              {displayedStrips.map((strip, index) => (
                <div
                  key={strip.id}
                  className="group relative"
                  onMouseEnter={() => setHoveredStrip(strip.id)}
                  onMouseLeave={() => setHoveredStrip(null)}
                >
                  {/* Favorite Star */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(strip.id);
                    }}
                    className="absolute top-2 right-2 z-20 bg-white border-2 border-black rounded-full p-2 hover:scale-110 transition-transform"
                  >
                    <svg 
                      className={`w-5 h-5 ${favorites.has(strip.id) ? 'fill-yellow-400' : 'fill-none'} stroke-black stroke-2`}
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>

                  <div className="bg-black p-3 rounded-lg border-4 border-black shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 cursor-pointer">
                    {/* Hover Preview */}
                    {hoveredStrip === strip.id && (
                      <div className="absolute inset-0 z-10 bg-white border-4 border-black rounded-lg p-2 transform scale-110 shadow-2xl pointer-events-none">
                        <div className="space-y-1 h-full overflow-auto">
                          {strip.photos.map((photo, idx) => (
                            <img key={idx} src={photo} alt={`Photo ${idx + 1}`} className="w-full rounded" />
                          ))}
                        </div>
                      </div>
                    )}

                    <div onClick={() => setSelectedStrip(strip)} className="space-y-2 mb-3">
                      {strip.photos.map((photo, idx) => (
                        <div key={idx} className="bg-white p-1 rounded overflow-hidden">
                          <img src={photo} alt={`Photo ${idx + 1}`} className="w-full h-auto" />
                        </div>
                      ))}
                    </div>
                    <p className="text-white text-xs text-center mb-2">{new Date(strip.created_at).toLocaleDateString()}</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); downloadStrip(strip.photos, strip.id); }}
                        className="flex-1 bg-green-500 text-white text-xs font-bold py-2 border-2 border-black rounded hover:bg-green-600 transition-colors"
                      >
                        Download
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteStrip(strip.id); }}
                        className="flex-1 bg-red-500 text-white text-xs font-bold py-2 border-2 border-black rounded hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="mt-8 text-center text-gray-600 text-sm">Created by: Booth Buddy Studio</p>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowShareModal(false)}>
          <div className="bg-white rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-4">Share Your Profile</h3>
            <p className="text-gray-600 mb-6">Share your photo booth profile with friends!</p>
            
            <div className="flex items-center gap-2 p-3 bg-gray-100 border-2 border-black rounded mb-4">
              <input type="text" value={window.location.href} readOnly className="flex-1 bg-transparent text-sm outline-none" />
            </div>

            <div className="flex gap-3">
              <button onClick={handleShare} className="flex-1 py-3 rounded bg-orange-500 text-white font-bold border-4 border-black hover:bg-orange-600 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                {copied ? "Copied!" : "Copy Link"}
              </button>
              <button onClick={() => setShowShareModal(false)} className="flex-1 py-3 rounded border-4 border-black font-bold hover:bg-gray-100 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Strip Modal */}
      {selectedStrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setSelectedStrip(null)}>
          <div className="bg-white rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="space-y-2 mb-4 max-h-[70vh] overflow-auto">
              {selectedStrip.photos.map((photo, idx) => (
                <img key={idx} src={photo} alt={`Photo ${idx + 1}`} className="rounded w-full" />
              ))}
            </div>
            <div className="flex gap-3 mb-3">
              <button onClick={() => downloadStrip(selectedStrip.photos, selectedStrip.id)} className="flex-1 py-3 rounded bg-green-500 text-white font-bold border-4 border-black hover:bg-green-600 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                Download
              </button>
              <button onClick={() => handleDeleteStrip(selectedStrip.id)} className="flex-1 py-3 rounded bg-red-500 text-white font-bold border-4 border-black hover:bg-red-600 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                Delete
              </button>
            </div>
            <button onClick={() => setSelectedStrip(null)} className="w-full py-3 rounded border-4 border-black font-bold hover:bg-gray-100 transition-colors">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
