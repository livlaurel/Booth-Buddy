import { useState, useRef } from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import WebcamCapture from "../components/WebcamCapture";
import { FaUserAlt } from "react-icons/fa";
import step1 from "../imgs/step1.png";
import step2 from "../imgs/step2.png";
import step3 from "../imgs/step3.png";
import step4 from "../imgs/step4.png";


function Booth() {
  const [coinInserted, setCoinInserted] = useState(false);
  const [coinAnimation, setCoinAnimation] = useState(false);
  const webcamRef = useRef<any>(null);

  // NEW: store photos for right-side strip
  const [stripPhotos, setStripPhotos] = useState<string[]>([]);

  const handleInsertCoin = () => {
    setCoinAnimation(true);
    setTimeout(() => {
      setCoinInserted(true);
      setCoinAnimation(false);
    }, 1000);
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
              <WebcamCapture ref={webcamRef} onPhotosUpdate={setStripPhotos} />
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
                disabled={!coinInserted}
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

        {/* Right Side: Photo Strip */}
        <div className="photo-strip bg-black p-4 rounded-lg shadow-lg flex flex-col justify-start items-center h-full">
          {stripPhotos.length > 0 ? (
            stripPhotos.map((photo, index) => (
              <div
                key={index}
                className="photo-frame mb-4 last:mb-0 bg-white p-1 rounded overflow-hidden"
              >
                <img
                  src={photo}
                  alt={`Strip Photo ${index}`}
                  className="w-full grayscale"
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

      </main>

      <Footer />
    </div>
  );
}

export default Booth;
