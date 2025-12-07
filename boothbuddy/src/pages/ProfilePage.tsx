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
  photos: string[];
  filter_type: string;
  created_at: string;
};

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoStrips, setPhotoStrips] = useState<PhotoStrip[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
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
        // Fetch user's photos
        fetchUserPhotos(fbUser.uid);
      }
    });
    return () => unsubscribe();
  }, []);

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
      {/* Profile Info Section */}
      <div className="max-w-6xl mx-auto w-full mt-8">
        <div className="bg-white border-4 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 mb-8">
          <h1 className="text-3xl font-bold mb-6 text-center">Your Profile</h1>

          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Profile Photo */}
            <div className="relative flex-shrink-0">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-black"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-black flex items-center justify-center">
                  <svg
                    className="w-16 h-16"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-grow w-full space-y-4">
              <div className="bg-gray-50 border-2 border-black rounded p-4">
                <p className="text-sm font-semibold text-gray-600 mb-1">NAME</p>
                <p className="text-lg font-bold">
                  {user.displayName || "Unnamed user"}
                </p>
              </div>

              <div className="bg-gray-50 border-2 border-black rounded p-4">
                <p className="text-sm font-semibold text-gray-600 mb-1">EMAIL</p>
                <p className="text-lg font-bold break-all">{user.email}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3 flex-shrink-0">
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

        {/* Photo Gallery Section */}
        <div className="bg-white border-4 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
          <h2 className="text-2xl font-bold mb-6">Your Photo Strips</h2>

          {loadingPhotos ? (
            <p className="text-center text-gray-600">Loading your photos...</p>
          ) : photoStrips.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">
                You haven't created any photo strips yet!
              </p>
              <button
                onClick={() => navigate("/booth")}
                className="bg-orange-500 text-white font-bold py-2 px-6 border-4 border-black rounded hover:bg-orange-600 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                Create Your First Strip
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {photoStrips.map((strip) => (
                <div
                  key={strip.id}
                  className="bg-black p-3 rounded-lg border-4 border-black shadow-lg hover:shadow-xl transition-shadow"
                >
                  {/* Photo Strip Preview */}
                  <div className="space-y-2 mb-3">
                    {strip.photos.map((photo, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-1 rounded overflow-hidden"
                      >
                        <img
                          src={photo}
                          alt={`Photo ${idx + 1}`}
                          className="w-full h-auto"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Date */}
                  <p className="text-white text-xs text-center mb-2">
                    {new Date(strip.created_at).toLocaleDateString()}
                  </p>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => downloadStrip(strip.photos, strip.id)}
                      className="flex-1 bg-green-500 text-white text-xs font-bold py-2 px-2 border-2 border-black rounded hover:bg-green-600 transition-colors"
                      title="Download"
                    >
                      ⬇️
                    </button>
                    <button
                      onClick={() => handleDeleteStrip(strip.id)}
                      className="flex-1 bg-red-500 text-white text-xs font-bold py-2 px-2 border-2 border-black rounded hover:bg-red-600 transition-colors"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <p className="mt-8 text-center text-gray-600 text-sm">
        Created by: Booth Buddy Studio
      </p>
    </div>
  );
};

export default ProfilePage;
