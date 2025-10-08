import Header from "../components/header"
import Footer from "../components/footer"

function Home() {
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex justify-center items-center">
          <p className="text-3xl font-black text-black">
            Booth Buddy
          </p>
        </main>
        <Footer />
      </div>
    </>
  )
}

export default Home
