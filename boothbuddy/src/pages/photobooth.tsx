import { useState, useRef, useEffect} from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import WebcamCapture from "../components/WebcamCapture";
import { FaUserAlt } from "react-icons/fa";
import PhotoBoothControls from "../components/PhotoBoothControls";
import type { Filter } from "../components/PhotoBoothControls";
import step1 from "../imgs/1.png";
import step2 from "../imgs/2.png";
import step3 from "../imgs/3.png";
import step4 from "../imgs/4.png";

function Booth() {
  const [coinInserted, setCoinInserted] = useState(false);
  const [coinAnimation, setCoinAnimation] = useState(false);
  const webcamRef = useRef<any>(null);

  
  const [filters, setFilters] = useState<Filter[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("none");
  const [filterIntensity, setFilterIntensity] = useState<number>(1.0);
  const [isApplyingFilter, setIsApplyingFilter] = useState(false);
  const [isGuest, setIsGuest] = useState(false);


  // NEW: store photos for right-side strip
  const [stripPhotos, setStripPhotos] = useState<string[]>([]);
  const originalPhotosRef = useRef<string[]>([]);

  const handleInsertCoin = () => {
    setCoinAnimation(true);
    setTimeout(() => {
      setCoinInserted(true);
      setCoinAnimation(false);
    }, 1000);
  };
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/v1/filters/types`)
      .then(res => res.json())
      .then(data => setFilters(data.filters || []))
      .catch(err => console.error("Failed to fetch filters:", err));
  }, []);

  useEffect(() => {
    if (isGuest && filters.length > 0) {
      const guestFilter = filters.find(f => f.id === "grayscale"); // allowed guest filter
      if (guestFilter) {
        setSelectedFilter(guestFilter.id);
        setFilterIntensity(guestFilter.defaultIntensity);
      }
    }
  }, [isGuest, filters]);

  const handlePhotosUpdate = (photos: string[]) => {
    setStripPhotos(photos);
    originalPhotosRef.current = photos; // store originals
  };

  const applyFilter = async () => {
    // Logic for applying filter
    if (selectedFilter === "none" || stripPhotos.length === 0) return;

    setIsApplyingFilter(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/filters/apply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            images: originalPhotosRef.current,
            filterType: selectedFilter,
            intensity: filterIntensity,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to apply filter");

      const data = await response.json();
      setStripPhotos(data.filteredImages); // Update preview dynamically
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to apply filter");
    } finally {
      setIsApplyingFilter(false);
    }
  };

  // Live preview: apply filter whenever filter or intensity changes
  useEffect(() => {
    if (stripPhotos.length === 0) return;
    if (selectedFilter === "none") {
      setStripPhotos(originalPhotosRef.current);
      return;
    }

    // debounce to avoid too many requests
    const timeout = setTimeout(() => {
      applyFilter();
    }, 200);

    return () => clearTimeout(timeout);
  }, [selectedFilter, filterIntensity]);

  const createStrip = async () => {
    // Logic for creating strip
    if (stripPhotos.length === 0) return;

    const canvas = document.createElement("canvas");
    const width = 200; // width of each photo
    const height = 280; // height of each photo
    canvas.width = width;
    canvas.height = height * stripPhotos.length;
    const ctx = canvas.getContext("2d")!;

    for (let i = 0; i < stripPhotos.length; i++) {
      const img = new Image();
      img.src = stripPhotos[i];
      await new Promise((res) => (img.onload = res));
      ctx.drawImage(img, 0, i * height, width, height);
    }

    const link = document.createElement("a");
    link.download = "photo-strip.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const resetPhotos = () => {
    setStripPhotos([]);
    setSelectedFilter("none");
  };

  return (
    <div className="flex flex-col min-h-screen text-[#3a3a3a]">
      <Header />

      <main className="flex-grow flex flex-row items-center justify-center space-x-10 p-10">

        {/* Left Side */}
        <div className="flex flex-col items-center">
          <div className="relative bg-white border-[3px] border-black rounded-xl p-6 shadow-lg w-96">

            {/* Red/Green Light */}
            <div
              className={`absolute top-2 right-2 w-4 h-4 rounded-full ${
                coinInserted
                  ? "bg-green-500 shadow-[0_0_8px_2px_rgba(34,197,94,0.7)]"
                  : "bg-red-500 shadow-[0_0_8px_2px_rgba(239,68,68,0.7)]"
              }`}
            ></div>

            <div className="webcam-container mb-4 rounded-lg overflow-hidden border-3 border-stone-950 shadow-inner">
              <WebcamCapture ref={webcamRef} onPhotosUpdate={handlePhotosUpdate}
              onGuestStatusChange={setIsGuest} />
            </div>

            <div className="flex flex-col items-center space-y-6">

              <div
                onClick={!coinInserted ? handleInsertCoin : undefined}
                className={`coin-slot w-20 h-10 bg-white border-2 border-orange-300 rounded-full relative cursor-pointer transition-all ${
                  coinInserted ? "opacity-50 pointer-events-none" : "hover:shadow-md"
                }`}
              >
                <div className="slot w-10 h-1 bg-stone-950 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded"></div>

                {coinAnimation && (
                  <div className="coin w-6 h-6 bg-yellow-400 border border-yellow-500 rounded-full absolute top-0 left-1/2 transform -translate-x-1/2 animate-drop shadow-sm"></div>
                )}
              </div>

              <p className="text-sm text-orange-400">
                {coinInserted ? "Coin Inserted" : "Click to Insert Coin"}
              </p>

              <button
                onClick={() => webcamRef.current?.startCapture()}
                className={`bg-orange-400 hover:bg-orange-500 text-white font-medium py-2 px-8 rounded-xl shadow-sm transition-all ${
                  coinInserted ? "" : "opacity-40 cursor-not-allowed"
                }`}
                disabled={!coinInserted || webcamRef.current?.isCapturing()}
              >
                Take Pictures
              </button>
            </div>
          </div>

          {/* Bottom Instruction Bar */}
          <div className="instruction-bar flex justify-center items-center space-x-4 mt-6 w-full">
            <div className="instruction-step w-24 h-24 bg-white rounded-lg border-3 border-black shadow-md flex items-center justify-center overflow-hidden transition-transform duration-300 hover:scale-110">
              <img src={step1} alt="Step 1" className="w-full h-full object-contain" />
            </div>
            <div className="instruction-step w-24 h-24 bg-white rounded-lg border-3 border-black shadow-md flex items-center justify-center overflow-hidden transition-transform duration-300 hover:scale-110">
              <img src={step2} alt="Step 2" className="w-full h-full object-contain" />
            </div>
            <div className="instruction-step w-24 h-24 bg-white rounded-lg border-3 border-black shadow-md flex items-center justify-center overflow-hidden transition-transform duration-300 hover:scale-110">
              <img src={step3}  alt="Step 3" className="w-full h-full object-contain" />
            </div>
            <div className="instruction-step w-24 h-24 bg-white rounded-lg border-3 border-black shadow-md flex items-center justify-center overflow-hidden transition-transform duration-300 hover:scale-110">
              <img src={step4}  alt="Step 4" className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
        
        <div>
          {/* Right Side: Photo Strip */}
          <div className="ml-10">
            <div className="photo-strip bg-black p-4 rounded-lg shadow-lg flex flex-col justify-start items-center h-full">
              {stripPhotos.length > 0 ? (
                stripPhotos.map((photo, index) => (
                  <div
                    key={index}
                    className="photo-frame mb-4 last:mb-0 bg-white p-1 rounded overflow-hidden w-20 h-28 flex items-center justify-center"
                  >
                    <img
                      src={photo}
                      alt={`Strip Photo ${index}`}
                      className="w-full"
                    />
                  </div>
                ))
              ) : (
                // Placeholder for empty photo strip
                Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="photo-frame mb-4 last:mb-0 bg-white p-1 rounded overflow-hidden w-20 h-28 flex items-center justify-center"
                  >
                    <FaUserAlt className="text-black text-3xl" />
                  </div>
                ))
              )}
            </div>
          </div>

            <div className="p-4 rounded-lg shadow-lg border-3 border-black mt-5 flex flex-col justify-start items-center h-full">
            <PhotoBoothControls
              filters={filters}
              selectedFilter={selectedFilter}
              setSelectedFilter={setSelectedFilter}
              filterIntensity={filterIntensity}
              setFilterIntensity={setFilterIntensity}
              isApplyingFilter={isApplyingFilter}
              applyFilter={applyFilter}
              createStrip={createStrip}
              resetPhotos={resetPhotos}
              isGuest={isGuest}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Booth;
