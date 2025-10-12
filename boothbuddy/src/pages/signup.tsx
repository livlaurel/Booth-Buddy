import { useState } from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);

    if (value !== password) {
      setPasswordError("Passwords do not match");
    } else {
      setPasswordError("");
    }
  };

  const isFormValid = password && confirmPassword && !passwordError;

  return (
    <>
      <div className="flex flex-col min-h-screen overflow-hidden">
        <Header />
        <main className="flex-grow flex justify-center items-center">
          <div className="fixed flex flex-col items-center space-y-6 bg-white p-8 rounded-lg border-4 border-[#e15c31]">
            <h1 className="text-3xl font-black text-black">Sign Up</h1>
            <form className="flex flex-col space-y-4 w-80">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="name"
                  id="name"
                  name="name"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#e15c31] focus:border-[#e15c31]"
                  placeholder="Enter your name"
                  required
                />
              </div>
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              <div className="relative">
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirm-password"
                  name="confirm-password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  className={`mt-1 block w-full px-3 py-2 border ${
                    passwordError ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-[#e15c31] focus:border-[#e15c31]`}
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-11 right-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                {passwordError && <p className="text-sm text-red-500 mt-1">{passwordError}</p>}
              </div>
              <button
                type="submit"
                className={`w-full py-2 px-4 rounded-lg transition duration-300 ${
                  isFormValid
                    ? "bg-[#e15c31] text-white hover:bg-[#ff9573]"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                disabled={!isFormValid}
              >
                Sign Up
              </button>
            </form>
            <div className="flex flex-row items-center space-x-2">
              <p className="text-sm text-gray-700">Have an account?</p>
              <a href="/#/login" className="text-sm text-gray-700 hover:underline">
                Log In
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

export default Signup;
