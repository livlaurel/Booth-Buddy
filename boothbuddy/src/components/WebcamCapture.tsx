import { useRef, useState, useEffect } from "react";

function WebcamCapture() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [stripImage, setStripImage] = useState<string | null>(null);

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

  const resetPhotos = () => {
    setCapturedImages([]);
    setStripImage(null);
  };

  const createStrip = () => {
    if (capturedImages.length === 4) {
      // Simulate creating a strip (replace with backend call later)
      alert("Strip created (simulated). Replace with backend integration.");
      setStripImage(capturedImages[0]); // Placeholder
    }
  };

  const downloadStrip = () => {
    if (!stripImage) return;

    const link = document.createElement("a");
    link.href = stripImage;
    link.download = "boothbuddy_strip.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareStrip = async () => {
    if (!stripImage) return;

    try {
      const res = await fetch(stripImage);
      const blob = await res.blob();
      const file = new File([blob], "boothbuddy_strip.png", { type: blob.type });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "My BoothBuddy Strip",
          text: "Check out my photo strip!",
          files: [file],
        });
      } else {
        alert("Sharing not supported. Please download instead.");
      }
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
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
          capturedImages.length >= 4 ? "bg-gray-400" : "bg-orange-500 hover:bg-orange-600"
        } text-white px-4 py-2 rounded`}
      >
        {capturedImages.length < 4
          ? `Capture Photo (${capturedImages.length}/4)`
          : "Max Reached"}
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

      {stripImage && (
        <div className="mt-6 flex flex-col items-center space-y-4">
          <img
            src={stripImage}
            alt="Photo Strip"
            className="rounded shadow-md w-full max-w-md"
          />
          <div className="flex gap-4">
            <button
              onClick={downloadStrip}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Download Strip
            </button>
            <button
              onClick={shareStrip}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Share Strip
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default WebcamCapture;
