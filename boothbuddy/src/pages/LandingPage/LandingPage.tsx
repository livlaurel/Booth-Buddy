import Header from "../../components/header";
import Footer from "../../components/footer"
import Booth from "../../imgs/homebooth.jpeg"
import { useNavigate } from "react-router-dom";
import { signInAnonymously } from "firebase/auth";
import { auth } from "../../firebaseConfig";


export default function LandingPage() {
  const navigate = useNavigate();
  const handleGuestLogin = async () => {
    try {
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;
      alert(`Welcome, Guest! Your session ID: ${user.uid}`);
      navigate("/booth"); 
    } catch (error) {
      console.error("Guest login failed:", error);
      alert("Guest login failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Header />
      <main className="flex-grow flex justify-center items-center">
        <div className="relative">
          {/* Booth image */}
          <img
            src={Booth}
            alt="Booth Buddy"
            className="fixed top-8 inset-x-0 mx-auto w-175 h-170"
          />
          {/* Login + Signup buttons */}
          <div className="fixed top-107 left-78 inset-x-0 flex flex-row items-center justify-center space-x-4">
            <button
              onClick={() => navigate("/login")}
              className="text-white bg-[#e15c31] px-4 py-2 rounded-lg hover:bg-[#ff9573] transition"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="text-white bg-[#e15c31] px-4 py-2 rounded-lg hover:bg-[#ff9573] transition"
            >
              Sign Up
            </button>
          </div>

          {/* Guest Login (bottom right) */}
          <button
            onClick={handleGuestLogin}
            className="fixed bottom-8 right-8 text-white bg-[#e15c31] px-4 py-2 rounded-lg hover:bg-[#ff9573] shadow-md"
          >
            Guest Login
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
