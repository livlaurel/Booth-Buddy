import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import type { Dispatch, SetStateAction } from "react";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

interface WebcamCaptureProps {
  onPhotosUpdate?: (photos: string[]) => void;
  onGuestStatusChange?: Dispatch<SetStateAction<boolean>>;
}

const WebcamCapture = forwardRef((props: WebcamCaptureProps, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [flash, setFlash] = useState(false);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [stripPreviewUrl, setStripPreviewUrl] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const guest = user ? user.isAnonymous : false;
      setIsGuest(guest);
      props.onGuestStatusChange?.(guest);
    });
    return () => unsubscribe();
  }, []);

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

  useImperativeHandle(ref, () => ({
    startCapture: capturePhotoSequence,
    isCapturing: () => isCapturing,
  }));

  const capturePhotoSequence = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setCapturedImages([]);
    props.onPhotosUpdate?.([]);
    setIsCapturing(true);

    const numPhotos = 4;
    const countdownSeconds = 3;

    for (let i = 0; i < numPhotos; i++) {
      for (let sec = countdownSeconds; sec > 0; sec--) {
        setCountdown(sec);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      setCountdown(null);

      setFlash(true);
      await new Promise((resolve) => setTimeout(resolve, 150));
      setFlash(false);

      const width = videoRef.current.videoWidth;
      const height = videoRef.current.videoHeight;
      canvasRef.current.width = width;
      canvasRef.current.height = height;

      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, width, height);
        const dataUrl = canvasRef.current.toDataURL("image/png");
        setCapturedImages((prev) => {
          const updated = [...prev, dataUrl];
          props.onPhotosUpdate?.(updated);
          return updated;
        });
      }
    }

    setIsCapturing(false);
  };

  return (
    <div className="relative flex flex-col items-center space-y-4 p-4">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="rounded shadow-md w-full max-w-md transform scale-x-[-1]"
      />
      {countdown !== null && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                        text-6xl font-bold text-white bg-transparent rounded-full 
                        w-32 h-32 flex items-center justify-center">
          {countdown}
        </div>
      )}
      {flash && (
        <div className="absolute inset-0 bg-white opacity-75 pointer-events-none"></div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      {stripPreviewUrl && (
        <div className="relative">
          <img
            src={stripPreviewUrl}
            alt="Photo Strip Preview"
            className={`rounded shadow-md max-w-md transition duration-500 ${isGuest ? "blur-sm brightness-90" : ""}`}
          />
          {isGuest && (
            <p className="absolute inset-x-0 top-10 text-center justify-center text-white text-lg font-semibold drop-shadow-md">
              Please <a href="/signup" className="text-lg text-blue-600 font-semibold hover:underline cursor-pointer">sign up</a> to preview or download your strip.
            </p>
          )}
        </div>
      )}
    </div>
  );
});

export default WebcamCapture;
