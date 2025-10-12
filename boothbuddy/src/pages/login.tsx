import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Header from "../components/header";
import Footer from "../components/footer";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/booth"); 
  };

  return (
    <>
      <div className="flex flex-col min-h-screen overflow-hidden">
        <Header />
        <main className="flex-grow flex justify-center items-center">
          <div className="fixed flex flex-col items-center space-y-6 bg-white p-8 rounded-lg border-4 border-[#e15c31]">
            <h1 className="text-3xl font-black text-black">Login</h1>
            <form className="flex flex-col space-y-4 w-80" onSubmit={handleLogin}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#e15c31] focus:border-[#e15c31]"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="relative">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#e15c31] focus:border-[#e15c31]"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-11 right-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <button
                type="submit"
                className="w-full bg-[#e15c31] text-white py-2 px-4 rounded-lg hover:bg-[#ff9573] transition duration-300"
              >
                Login
              </button>
            </form>
            <div className="flex flex-row items-center space-x-2">
              <p className="text-sm text-gray-700">Don't have an account?</p>
              <a href="/#/signup" className="text-sm text-gray-700 hover:underline">
                Sign Up
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

export default Login;
