import { useRef, useState, useEffect } from "react";

function WebcamCapture() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [stripPreviewUrl, setStripPreviewUrl] = useState<string | null>(null);

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

  // Capture a photo
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    if (capturedImages.length >= 4) return;

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
  };

  // Reset captured images and preview
  const resetPhotos = () => {
    setCapturedImages([]);
    setStripPreviewUrl(null);
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
          frameWidth: 320, // You can adjust this or make it dynamic
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

    // Cleanup
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed:", error);
  }
};


  // Share strip image (basic example using navigator.share)
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

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="rounded shadow-md w-full max-w-md"
      />
      <button
        onClick={capturePhoto}
        disabled={capturedImages.length >= 4}
        className={`${
          capturedImages.length >= 4 ? "bg-gray-400 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600"
        } text-white px-4 py-2 rounded transition`}
      >
        {capturedImages.length < 4
          ? `Capture Photo (${capturedImages.length}/4)`
          : "Max Photos Captured"}
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

      {capturedImages.length === 4 && (
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
