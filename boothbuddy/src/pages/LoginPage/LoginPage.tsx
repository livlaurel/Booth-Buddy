import { useState } from "react";
import { Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebaseConfig";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [resetMessage, setResetMessage] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;

          alert(`Welcome back, ${user.displayName || user.email}!`);
        } catch (err: any) {
        setError(err.message);
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
        setError(err.message);
      }
    };
    return (
        <div className="flex items-center justify-center min-h-screen bg-black">
          <div className="bg-white p-8 rounded-lg shadow-lg w-96">
            <h2 className="text-2xl font-bold text-center mb-6 text-black">Login</h2>

            <form onSubmit={handleLogin} className="space-y-4">
                {/* Email */}
                <div>
                    <label className="block text-gray-700">Email</label>
                    <input
                    type="text"
                    placeholder="Enter email"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                {/* Password */}
                <div>
                    <label className="block text-gray-700">Password</label>
                    <input
                    type="password"
                    placeholder="Enter password"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    />
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
                {resetMessage && <p className="text-black text-sm">{resetMessage}</p>}

                {/* Login Button */}
                <button
                    type="submit"
                    className="w-full py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
                >
                    LOGIN
                </button>
            </form>

            {/* Signup Link */}
            <p className="text-center mt-4 text-black">
              Don’t have an account?{" "}
              <Link to="/signup" className="text-blue-600 hover:underline">
                Signup
              </Link>
            </p>
          </div>
        </div>
    );
}