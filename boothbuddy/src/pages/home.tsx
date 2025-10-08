import Header from "../components/header"
import Footer from "../components/footer"

function Home() {
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex justify-center items-center">
          <div className="flex flex-col items-center space-y-4">
            <h1 className="text-3xl font-black text-black">
              Booth Buddy
            </h1>
            <div>
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
