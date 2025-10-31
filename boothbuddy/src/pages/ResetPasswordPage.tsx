import { useState } from "react";
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getPasswordChecklist, isPasswordValid } from "../utils/validators";
import Header from "../components/header";
import Footer from "../components/footer";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const oobCode = searchParams.get("oobCode");

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setError("Please fill out both fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!isPasswordValid(password)) {
      setError("Password does not meet the required criteria.");
      return;
    }

    try {
      await confirmPasswordReset(auth, oobCode || "", password);
      setSuccess("Password reset successful! You can now log in.");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err: any) {
      console.error(err);
      setError("Reset link is invalid or expired. Please try again.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Header />
      <main className="flex-grow flex justify-center items-center">
        <div className="flex flex-col items-center space-y-6 bg-white p-8 rounded-lg border-4 border-[#e15c31] shadow-md w-96">
          <h1 className="text-3xl font-black text-black">Reset Password</h1>
          <form onSubmit={handleResetPassword} className="flex flex-col space-y-4 w-full">
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#e15c31] focus:border-[#e15c31]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <input
                type="password"
                placeholder="Re-enter new password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#e15c31] focus:border-[#e15c31]"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {password && (
              <ul className="mt-2 text-sm">
                <li className={getPasswordChecklist(password).length ? "text-green-600" : "text-red-500"}>
                  {getPasswordChecklist(password).length ? "✓" : "✗"} Between 6–8 characters
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

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-600 text-sm">{success}</p>}

            <button
              type="submit"
              className="w-full bg-[#e15c31] text-white py-2 px-4 rounded-lg hover:bg-[#ff9573] transition duration-300"
            >
              Reset Password
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}