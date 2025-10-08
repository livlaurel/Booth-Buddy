import logo from "../imgs/boothbuddy_logo.png";

const Header = () => {
    return (
        <main className="bg-[#fff9f9] w-full fixed top-0 left-0">
            <nav className="flex justify-between items-center ml-5">
                <a href="/" className="text-black flex justify-left">
                    <img src={logo} alt="logo" className="w-40 h-30" />
                </a>
            </nav>    
        </main>
    )
}

export default Header;