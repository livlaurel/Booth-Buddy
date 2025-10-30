import { useRef, useState, useEffect } from "react";

interface Filter {
  id: string;
  name: string;
  description: string;
  defaultIntensity: number;
  minIntensity: number;
  maxIntensity: number;
}

function WebcamCapture() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [countdown, setCountdown] = useState<number | null>(null); // For countdown display
  const [isCapturing, setIsCapturing] = useState(false); // To disable buttons during capture
  const [flash, setFlash] = useState(false); // For camera flash effect
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [stripPreviewUrl, setStripPreviewUrl] = useState<string | null>(null);
  
  // Filter states
  const [filters, setFilters] = useState<Filter[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("none");
  const [filterIntensity, setFilterIntensity] = useState<number>(1.0);
  const [isApplyingFilter, setIsApplyingFilter] = useState(false);

  // Start webcam
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
        alert("Error accessing webcam. Please make sure no other app is using it.");
      }
    };

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  // Load available filters
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/v1/filters/types`)
      .then(res => res.json())
      .then(data => setFilters(data.filters || []))
      .catch(err => console.error('Failed to load filters:', err));
  }, []);

  // Capture a photo
  const capturePhotoSequence = async () => {
  if (!videoRef.current || !canvasRef.current) return;

  // Reset previous photos
  setCapturedImages([]);
  setStripPreviewUrl(null);
  setSelectedFilter("none");

  setIsCapturing(true);

  const numPhotos = 4;
  const countdownSeconds = 3;

  for (let i = 0; i < numPhotos; i++) {
    // Countdown
    for (let sec = countdownSeconds; sec > 0; sec--) {
      setCountdown(sec);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    setCountdown(null);

    // Flash effect
    setFlash(true);
    await new Promise((resolve) => setTimeout(resolve, 150));
    setFlash(false);

    // Capture photo
    const width = videoRef.current.videoWidth;
    const height = videoRef.current.videoHeight;
    canvasRef.current.width = width;
    canvasRef.current.height = height;

    const ctx = canvasRef.current.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, width, height);
      const dataUrl = canvasRef.current.toDataURL("image/png");
      setCapturedImages((prev) => [...prev, dataUrl]);
    }
  }

  setIsCapturing(false);
};


  // Reset captured images and preview
  const resetPhotos = () => {
    setCapturedImages([]);
    setStripPreviewUrl(null);
    setSelectedFilter("none");
  };

  // Apply filter to images
  const applyFilter = async () => {
    if (selectedFilter === "none" || capturedImages.length !== 4) return;

    setIsApplyingFilter(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/filters/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: capturedImages,
          filterType: selectedFilter,
          intensity: filterIntensity
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to apply filter");
      }

      const data = await response.json();
      setCapturedImages(data.filteredImages);
      alert("Filter applied successfully!");

    } catch (error: any) {
      console.error("Error applying filter:", error);
      alert(`Error applying filter: ${error.message}`);
    } finally {
      setIsApplyingFilter(false);
    }
  };

  // Send images to backend to create photo strip
  const createStrip = async () => {
    if (capturedImages.length !== 4) {
      alert("Please capture exactly 4 photos to create a strip.");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/strips/compose`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          frames: capturedImages,
          frameWidth: 320,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to create strip");
      }

      const data = await response.json();
      setStripPreviewUrl(`${import.meta.env.VITE_API_URL}${data.previewUrl}`);
      alert("Strip created! Preview below.");

    } catch (error: any) {
      console.error("Error creating strip:", error);
      alert(`Error creating strip: ${error.message}`);
    }
  };


  // Save strip to Supabase Storage with Firebase user ID
  const saveToGallery = async () => {
    if (!stripPreviewUrl) {
      alert("No strip to save");
      return;
    }

    try {
      // Import auth from Firebase config
      const { auth } = await import("../firebaseConfig");
      const currentUser = auth.currentUser;

      if (!currentUser) {
        alert("Please log in to save strips");
        return;
      }

      const stripId = stripPreviewUrl.split("/").pop()?.split(".")[0];
      if (!stripId) return;

      const userId = currentUser.uid;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/storage/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strip_id: stripId,
          user_id: userId
        })
      });

      if (!response.ok) throw new Error("Failed to save");

      const data = await response.json();
      console.log("✅ Saved to gallery:", data);
      alert("✅ Strip saved to your gallery!");
    } catch (error: any) {
      console.error("Save failed:", error);
      alert(`Failed to save: ${error.message}`);
    }
  };

  // Download strip image
  const downloadStrip = async () => {
    if (!stripPreviewUrl) return;

    try {
      const response = await fetch(stripPreviewUrl);
      if (!response.ok) throw new Error("Failed to fetch image");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "photostrip.png";
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  // Share strip image
  const shareStrip = async () => {
    if (!stripPreviewUrl) return;

    if (navigator.share) {
      try {
        const response = await fetch(stripPreviewUrl);
        const blob = await response.blob();
        const file = new File([blob], "photostrip.png", { type: "image/png" });

        await navigator.share({
          files: [file],
          title: "My Photo Strip",
          text: "Check out my photo strip from BoothBuddy!",
        });
      } catch (error) {
        alert("Sharing failed: " + error);
      }
    } else {
      alert("Sharing not supported on this browser.");
    }
  };

  const selectedFilterData = filters.find(f => f.id === selectedFilter);

  return (
    <div className="relative flex flex-col items-center space-y-4 p-4">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="rounded shadow-md w-full max-w-md"
      />
      {countdown !== null && (
  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                  text-6xl font-bold text-white bg-black bg-opacity-50 rounded-full 
                  w-32 h-32 flex items-center justify-center">
    {countdown}
  </div>
)}
{flash && (
  <div className="absolute inset-0 bg-white opacity-75 pointer-events-none"></div>
)}

      <button
        onClick={capturePhotoSequence}
  disabled={isCapturing}
  className={`${
    isCapturing ? "bg-gray-400 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600"
  } text-white px-4 py-2 rounded transition`}
>
  {isCapturing ? "Capturing..." : "Capture 4 Photos"}
      </button>

      <canvas ref={canvasRef} className="hidden" />

      {capturedImages.length > 0 && (
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          {capturedImages.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`Capture ${idx + 1}`}
              className="w-32 h-auto rounded shadow"
            />
          ))}
        </div>
      )}

      {/* Filter Selector - Shows after 4 photos captured */}
      {capturedImages.length === 4 && !stripPreviewUrl && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg shadow w-full max-w-md">
          <h3 className="text-lg font-semibold mb-3">Apply Filter (Optional)</h3>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Select Filter:</label>
            <select 
              value={selectedFilter}
              onChange={(e) => {
                setSelectedFilter(e.target.value);
                const filter = filters.find(f => f.id === e.target.value);
                if (filter) setFilterIntensity(filter.defaultIntensity);
              }}
              disabled={isApplyingFilter}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="none">No Filter</option>
              {filters.map(filter => (
                <option key={filter.id} value={filter.id}>
                  {filter.name} - {filter.description}
                </option>
              ))}
            </select>
          </div>

          {selectedFilter !== "none" && selectedFilterData && (
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">
                Intensity: {filterIntensity.toFixed(1)}
              </label>
              <input 
                type="range"
                min={selectedFilterData.minIntensity}
                max={selectedFilterData.maxIntensity}
                step="0.1"
                value={filterIntensity}
                onChange={(e) => setFilterIntensity(parseFloat(e.target.value))}
                disabled={isApplyingFilter}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>{selectedFilterData.minIntensity}</span>
                <span>{selectedFilterData.maxIntensity}</span>
              </div>
            </div>
          )}

          {selectedFilter !== "none" && (
            <button
              onClick={applyFilter}
              disabled={isApplyingFilter}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-gray-400 mb-2"
            >
              {isApplyingFilter ? "Applying..." : "Apply Filter"}
            </button>
          )}
        </div>
      )}

      {capturedImages.length === 4 && !stripPreviewUrl && (
        <div className="mt-4 flex gap-4">
          <button
            onClick={createStrip}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Create Strip
          </button>
          <button
            onClick={resetPhotos}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Reset
          </button>
        </div>
      )}

      {stripPreviewUrl && (
        <div className="mt-6 flex flex-col items-center space-y-4">
          <h2 className="text-xl font-semibold">Photo Strip Preview:</h2>
          <img src={stripPreviewUrl} alt="Photo Strip Preview" className="rounded shadow-md max-w-md" />
          <div className="flex space-x-4 mt-2">
            <button
              onClick={downloadStrip}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Download
            </button>
            <button
              onClick={saveToGallery}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Save to Gallery
            </button>
            <button
              onClick={shareStrip}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Share
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default WebcamCapture;
