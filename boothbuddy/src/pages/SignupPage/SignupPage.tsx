import { Link } from "react-router-dom";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-6 text-black">Sign Up</h2>

        <form className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="text"
              placeholder="Enter email"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          {/* Username */}
          <div>
            <label className="block text-gray-700">Username</label>
            <input
              type="text"
              placeholder="Enter username"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Signup Button */}
          <button
            type="submit"
            className="w-full py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
          >
            Sign Up
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center mt-4 text-black">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}