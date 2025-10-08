import Header from "../components/header"
import Footer from "../components/footer"
import Booth from "../imgs/homebooth.png"

function Home() {
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex justify-center items-center">
          <img src={Booth} alt="logo" className="w-160 h-140" />
          <div className="flex flex-col items-center space-y-4">
            <h1 className="text-3xl font-black text-black">
              Booth Buddy
            </h1>
            <div className="flex flex-col items-center space-y-2">
              <a href="/#/login" className="text-white bg-black px-4 py-2 rounded hover:bg-gray-800">
                Login
              </a>
              <a href="/#/signup" className="text-white bg-black px-4 py-2 rounded hover:bg-gray-800">
                SignUp
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}

export default Home
