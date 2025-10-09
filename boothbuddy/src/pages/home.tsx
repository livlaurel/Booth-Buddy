import Header from "../components/header"
import Footer from "../components/footer"
import Booth from "../imgs/homebooth.png"

function Home() {
  return (
    <>
      <div className="flex flex-col min-h-screen overflow-hidden">
        <Header />
        <main className="flex-grow flex justify-center items-center">
          <div className="relative">
            <img src={Booth} alt="logo" className="fixed top-8 inset-x-0 mx-auto w-190 h-165" />
            <div className="fixed top-107 left-80 inset-x-0 flex flex-row items-center justify-center space-x-4">
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
