import { useRef, useState, useEffect } from "react";

function WebcamCapture() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [captured, setCaptured] = useState<string | null>(null);

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

    // Cleanup on unmount
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  // Capture image from video
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const width = videoRef.current.videoWidth;
    const height = videoRef.current.videoHeight;

    canvasRef.current.width = width;
    canvasRef.current.height = height;

    const ctx = canvasRef.current.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, width, height);
      const dataUrl = canvasRef.current.toDataURL("image/png");
      setCaptured(dataUrl);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <video ref={videoRef} autoPlay playsInline className="rounded shadow-md w-full max-w-md" />
      <button
        onClick={capturePhoto}
        className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
      >
        Capture Photo
      </button>

      <canvas ref={canvasRef} className="hidden" />

      {captured && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Captured Photo:</h2>
          <img src={captured} alt="Captured" className="rounded shadow-md w-full max-w-md" />
        </div>
      )}
    </div>
  );
}

export default WebcamCapture;
