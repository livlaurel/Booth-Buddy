import { Link } from "react-router-dom";
import logo from "../../assets/logo.png"; 

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      {/* Logo */}
      <img src={logo} alt="BoothBuddy Logo" className="w-40 h-40 mb-8" />

      {/* Links */}
      <div className="space-y-4 text-center">
        <p>
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:underline">
            Login
          </Link>
        </p>
        <p>
          Don’t have an account?{" "}
          <Link to="/signup" className="text-blue-400 hover:underline">
            Signup
          </Link>
        </p>
        <p>
          <Link to="/" className="text-blue-400 hover:underline">
            Guest Login
          </Link>
        </p>
      </div>
    </div>
  );
}
