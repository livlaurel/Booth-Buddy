import { useRef, useState, useEffect } from "react";

function WebcamCapture() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Start the webcam
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

  // Capture image
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
      setCapturedImage(dataUrl);
    }
  };

  // Download image
  const downloadImage = () => {
    if (!capturedImage) return;

    const link = document.createElement("a");
    link.href = capturedImage;
    link.download = "boothbuddy_photo.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Share image (Web Share API)
  const shareImage = async () => {
    if (!capturedImage) return;

    if (navigator.canShare && navigator.canShare({ files: [] })) {
      try {
        const res = await fetch(capturedImage);
        const blob = await res.blob();
        const file = new File([blob], "boothbuddy_photo.png", { type: blob.type });

        await navigator.share({
          files: [file],
          title: "BoothBuddy Photo",
          text: "Check out my photo from BoothBuddy!",
        });
        console.log("Shared successfully");
      } catch (err) {
        console.error("Sharing failed:", err);
      }
    } else {
      alert("Sharing not supported on this browser. Please download instead.");
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
        className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
      >
        Capture Photo
      </button>

      <canvas ref={canvasRef} className="hidden" />

      {capturedImage && (
        <div className="mt-4 flex flex-col items-center space-y-2">
          <img
            src={capturedImage}
            alt="Captured"
            className="rounded shadow-md w-full max-w-md"
          />

          <div className="mt-4 flex space-x-4">
            <button
              onClick={downloadImage}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Download
            </button>

            <button
              onClick={shareImage}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
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
