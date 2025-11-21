import logo from "../imgs/boothbuddy_logo.png";
import { FaUserAlt } from "react-icons/fa";
import { auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";

const Header = () => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <main className="w-full fixed top-0 left-0">
      <nav className="flex justify-between items-center px-10">
        {/* Logo */}
        <a href="/" className="text-black flex justify-left">
          <img src={logo} alt="logo" className="w-40 h-30" />
        </a>

        {/* Middle link 
        <a
          href="/gallery"
          className="mx-4 text-black hover:text-orange-500 font-semibold"
        >
          Gallery
        </a> */}

        {/* Profile icon + hover menu */}
        <div className="relative group">
          {/* Icon (same size/styles as before) */}
          <a
            href="#/profile"
            className="flex items-center justify-center w-9 h-9 bg-[#e15c31] rounded-full hover:bg-gray-300"
          >
            <FaUserAlt className="text-[#fff9f9] text-base" />
          </a>

          {/* Hover popup */}
          <div
            className="
              absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-lg
              opacity-0 invisible group-hover:opacity-100 group-hover:visible
              transition-all duration-200
            "
          >
            <a
              href="/profile"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-t-xl text-left"
            >
              Profile
            </a>

            <button
              disabled
              className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Change Password
            </button>

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 rounded-b-xl"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
    </main>
  );
};

export default Header;