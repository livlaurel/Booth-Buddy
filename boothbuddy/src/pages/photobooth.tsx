import Header from "../components/header";
import Footer from "../components/footer";
import WebcamCapture from "../components/WebcamCapture";

function Booth() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Photo Booth</h1>
        <WebcamCapture />
      </main>
      <Footer />
    </div>
  );
}

export default Booth;
