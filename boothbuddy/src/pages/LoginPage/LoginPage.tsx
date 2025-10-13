import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { errorMessage } from "../../utils/errorMessages";
import Header from "../../components/header";
import Footer from "../../components/footer";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [resetMessage, setResetMessage] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;

          alert(`Welcome back, ${user.displayName || user.email}!`);
          navigate("/booth");
        } catch (err: any) {
          console.error(err)
          setError(errorMessage(err.code));
        }
    };
    const handleForgotPassword = async () => {
      if (!email) {
        setError("Please enter your email first.");
        return;
      }

      try {
        await sendPasswordResetEmail(auth, email);
        setResetMessage("Password reset email sent! Check your inbox.");
      } catch (err: any) {
        setError(errorMessage(err.code));
      }
    };
    return (
        <div className="flex flex-col min-h-screen overflow-hidden">
          <Header />
          <main className="flex-grow flex justify-center items-center">
            <div className="flex flex-col items-center space-y-6 bg-white p-8 rounded-lg border-4 border-[#e15c31] shadow-md">
              <h1 className="text-3xl font-black text-black">Login</h1>
              <form onSubmit={handleLogin} className="flex flex-col space-y-4 w-80">
                  {/* Email */}
                  <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                      type="text"
                      id="email"
                      placeholder="Enter email"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#e15c31] focus:border-[#e15c31]"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      />
                  </div>

                  {/* Password */}
                  <div className="relative">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                      <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      placeholder="Enter password"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#e15c31] focus:border-[#e15c31]"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-11 right-3 flex items-center text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                  </div>

                  {/* Forgot Password Link */}
                  <p
                    onClick={handleForgotPassword}
                    className="text-sm text-blue-600 hover:underline cursor-pointer text-right"
                  >
                    Forgot Password?
                  </p>

                  {/* Error Message */}
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  {resetMessage && <p className="text-green-600 text-sm">{resetMessage}</p>}

                  {/* Login Button */}
                  <button
                      type="submit"
                      className="w-full bg-[#e15c31] text-white py-2 px-4 rounded-lg hover:bg-[#ff9573] transition duration-300"
                  >
                      LOGIN
                  </button>
              </form>

              {/* Signup Link */}
              <div className="flex flex-row items-center space-x-2">
                <p className="text-sm text-gray-700">Don’t have an account?</p>
                <Link to="/signup" className="text-sm text-blue-600 hover:underline cursor-pointer">
                  Sign Up
                </Link>
              </div>   
            </div>
          </main>
          <Footer />
        </div>
    );
}