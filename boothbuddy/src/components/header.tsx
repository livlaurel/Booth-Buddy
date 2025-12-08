import logo from "../imgs/boothbuddy_logo.png";
import { FaUserAlt } from "react-icons/fa";

const Header = () => {
    return (
        <main className="w-full fixed top-0 left-0">
            <nav className="flex justify-between items-center px-10">
                <a href="/" className="text-black flex justify-left">
                    <img src={logo} alt="logo" className="w-40 h-30" />
                </a>
                <a href="/profile" className="flex items-center justify-center w-9 h-9 bg-[#e15c31] rounded-full hover:bg-gray-300">
                    <FaUserAlt className="text-[#fff9f9] text-base" />
                </a>
            </nav>
        </main>
    );
};

export default Header;