import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { errorMessage } from "../../utils/errorMessages";
import { getPasswordChecklist, isPasswordValid } from "../../utils/validators";
import Header from "../../components/header";
import Footer from "../../components/footer";
import { FaEye, FaEyeSlash } from "react-icons/fa";


export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !username || !password) {
      setError("All fields are required.");
      return;
    }

    if (!isPasswordValid(password)) {
      setError("Password does not meet the required criteria.");
      return;
    }


    try {
      // 1. Create user with email + password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // 2. Update profile with username
      await updateProfile(userCredential.user, { displayName: username });

      navigate("/login"); 
    } catch (err: any) {
      setError(errorMessage(err.code));
    }
  };


  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Header />
      <main className="flex-grow flex justify-center items-center">
        <div className="flex flex-col items-center space-y-6 bg-white p-8 rounded-lg border-4 border-[#e15c31] shadow-md">
          <h1 className="text-3xl font-black text-black">Sign Up</h1>

          <form onSubmit={handleSignup} className="flex flex-col space-y-4 w-80">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                placeholder="Enter email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#e15c31] focus:border-[#e15c31]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                placeholder="Enter username"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#e15c31] focus:border-[#e15c31]"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type={showPassword ? "text" : "password"}
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

              {password && (
                <ul className="mt-2 text-sm">
                  <li className={getPasswordChecklist(password).length ? "text-green-600" : "text-red-500"}>
                    {getPasswordChecklist(password).length ? "✓" : "✗"} At least 8 characters
                  </li>
                  <li className={getPasswordChecklist(password).number ? "text-green-600" : "text-red-500"}>
                    {getPasswordChecklist(password).number ? "✓" : "✗"} Contains a number
                  </li>
                  <li className={getPasswordChecklist(password).uppercase ? "text-green-600" : "text-red-500"}>
                    {getPasswordChecklist(password).uppercase ? "✓" : "✗"} Contains an uppercase letter
                  </li>
                  <li className={getPasswordChecklist(password).lowercase ? "text-green-600" : "text-red-500"}>
                    {getPasswordChecklist(password).lowercase ? "✓" : "✗"} Contains a lowercase letter
                  </li>
                  <li className={getPasswordChecklist(password).special ? "text-green-600" : "text-red-500"}>
                    {getPasswordChecklist(password).special ? "✓" : "✗"} Contains a special character
                  </li>
                </ul>
              )}
            </div>

            {/* Error message */}
            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* Signup Button */}
            <button
              type="submit"
              disabled={!email || !username || !password}
              className={`w-full py-2 px-4 rounded-lg transition duration-300 ${
                !email || !username || !password
                ? "bg-[#e15c31] text-white cursor-not-allowed"
                : "bg-[#e15c31] text-white hover:bg-[#ff9573]"
                }`}
            >
              Sign Up
            </button>
          </form>

          {/* Login Link */}
          <div className="flex flex-row items-center space-x-2">
            <p className="text-sm text-gray-700">Already have an account?</p>
            <Link to="/login" className="text-sm text-gray-700 hover:underline">
              Log In
            </Link>
          </div>  
        </div>
      </main>
      <Footer />
    </div>
  );
}