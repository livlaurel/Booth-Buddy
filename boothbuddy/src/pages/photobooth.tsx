import { useState } from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import WebcamCapture from "../components/WebcamCapture";

function Booth() {
  const [coinInserted, setCoinInserted] = useState(false);
  const [coinAnimation, setCoinAnimation] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);

  const handleInsertCoin = () => {
    setCoinAnimation(true);
    setTimeout(() => {
      setCoinInserted(true);
      setCoinAnimation(false);
    }, 1000);
  };

  const handleTakePhoto = () => {
    if (photos.length < 4) {
      const newPhoto = `Photo ${photos.length + 1}`;
      setPhotos((prevPhotos) => [...prevPhotos, newPhoto]);
    }
    if (photos.length === 3) {
      setCoinInserted(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen text-[#3a3a3a]">
      <Header />
      <main className="flex-grow flex flex-row items-center justify-center space-x-10 p-10">
        <div className="flex flex-col items-center">

          <div className="relative bg-white border-[3px] border-orange-200 rounded-xl p-6 shadow-lg w-96">

            <div className="webcam-container mb-4 rounded-lg overflow-hidden border border-orange-100 shadow-inner">
              <WebcamCapture />
            </div>

            <div className="flex flex-col items-center space-y-6">
              <div
                onClick={!coinInserted ? handleInsertCoin : undefined}
                className={`coin-slot w-20 h-10 bg-white border-2 border-orange-300 rounded-full relative cursor-pointer transition-all ${
                  coinInserted ? "opacity-50 pointer-events-none" : "hover:shadow-md"
                }`}
              >
                <div className="slot w-10 h-1 bg-orange-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded"></div>

                {coinAnimation && (
                  <div className="coin w-6 h-6 bg-yellow-400 border border-yellow-500 rounded-full absolute top-0 left-1/2 transform -translate-x-1/2 animate-drop shadow-sm"></div>
                )}
              </div>

              <p className="text-sm text-orange-400">
                {coinInserted ? "Coin Inserted" : "Tap to insert coin"}
              </p>

              {/* Take Photo Button */}
              <button
                onClick={handleTakePhoto}
                className={`bg-orange-400 hover:bg-orange-500 text-white font-medium py-2 px-8 rounded-xl shadow-sm transition-all ${
                  coinInserted ? "" : "opacity-40 cursor-not-allowed"
                }`}
                disabled={!coinInserted}
              >
                Take Photo 
              </button>
            </div>
          </div>
        </div>

        <div className="photo-strip bg-white border-[3px] border-orange-200 p-4 rounded-xl shadow-lg w-28 flex flex-col items-center space-y-4">
          {photos.map((photo, index) => (
            <div
              key={index}
              className="w-24 h-32 bg-orange-50 border border-orange-200 rounded-md flex items-center justify-center text-xs text-orange-700 shadow-inner"
            >
              {photo}
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Booth;
