import logo from "../imgs/boothbuddy_logo.png";

const Header = () => {
    return (
        <main className="bg-[#fff9f0] w-full fixed top-0 left-0">
            <nav className="flex justify-between items-center ml-5">
                <a href="/" className="text-black flex justify-left">
                    <img src={logo} alt="livia" className="w-35 h-30" />
                </a>
                <div className="flex-grow font-[Arial, Helvetica, sans-serif] flex font-bold underline justify-end items-center">
                    <div className="flex space-x-8 text-xl">
                    </div>
                </div>
                <div className="w-25 h-25"></div> 
            </nav>    
        </main>
    )
}

export default Header;