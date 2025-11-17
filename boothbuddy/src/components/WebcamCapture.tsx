import { useRef, useState, useEffect, forwardRef, useImperativeHandle} from "react";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

interface WebcamCaptureProps {
  onPhotosUpdate?: (photos: string[]) => void; // NEW
}

const WebcamCapture = forwardRef((props: WebcamCaptureProps, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [countdown, setCountdown] = useState<number | null>(null); // For countdown display
  const [isCapturing, setIsCapturing] = useState(false); // To disable buttons during capture
  const [flash, setFlash] = useState(false); // For camera flash effect
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  //const [stripPreviewUrl, setStripPreviewUrl] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsGuest(user ? user.isAnonymous : false);
    });
    return () => unsubscribe();
  }, []);
  

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


  useImperativeHandle(ref, () => ({
    startCapture: capturePhotoSequence  // parent calls this
  }));

  // Capture a photo
  const capturePhotoSequence = async () => {
  if (!videoRef.current || !canvasRef.current) return;

  // Reset previous photos
  setCapturedImages([]);
  props.onPhotosUpdate?.([]);
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
                  text-6xl font-bold text-white bg-black bg-opacity-50 rounded-full 
                  w-32 h-32 flex items-center justify-center">
    {countdown}
  </div>
)}
{flash && (
  <div className="absolute inset-0 bg-white opacity-75 pointer-events-none"></div>
)}

      <canvas ref={canvasRef} className="hidden" />

      {/* {capturedImages.length > 0 && (
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
      )} */}

      {/* Filter Selector - Shows after 4 photos captured */}
      {/* {capturedImages.length === 4 && !stripPreviewUrl && (
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
          <div className="relative">
            <img
              src={stripPreviewUrl}
              alt="Photo Strip Preview"
              className={`rounded shadow-md max-w-md transition duration-500 ${isGuest ? "blur-sm brightness-90" : ""}`}
            />
            {isGuest && (
              <p className="absolute inset-x-0 top-10 text-center justify-center text-white text-lg font-semibold drop-shadow-md">
                Please <a href="/signup" className="text-lg text-blue-600 font-semibold hover:underline cursor-pointer" >sign up</a> to preview or download your strip.
              </p>
            )}
          </div>
   

          {!isGuest && (
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
          )}
        </div>
      )} */}
    </div>
  );
});

export default WebcamCapture;
