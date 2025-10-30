import { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

interface Strip {
  id: string;
  name: string;
  created_at: string;
  url: string;
}

function Gallery() {
  const [strips, setStrips] = useState<Strip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setError("Please log in to view your gallery");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://127.0.0.1:5000/api/v1/storage/user/${user.uid}/strips`
        );

        if (!response.ok) throw new Error("Failed to fetch strips");

        const data = await response.json();
        
        // If API returns empty, show test data for demo
        if (!data.items || data.items.length === 0) {
          setStrips([
            {
              id: "demo1",
              name: "Sample Strip",
              created_at: new Date().toISOString(),
              url: "https://via.placeholder.com/300x200?text=Your+Gallery"
            }
          ]);
        } else {
          setStrips(data.items);
        }
      } catch (err: any) {
        console.log("Gallery fetch error:", err);
        setError("Error loading gallery");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="text-center py-10">Loading gallery...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Gallery</h1>
      {strips.length === 0 ? (
        <p className="text-gray-600">No strips saved yet. Create one!</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {strips.map((strip) => (
            <div key={strip.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
              <img src={strip.url} alt="Strip" className="w-full h-48 object-cover" />
              <div className="p-2 text-sm text-gray-600">{new Date(strip.created_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Gallery;
