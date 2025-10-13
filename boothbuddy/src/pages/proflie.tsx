import Header from "../components/header"
import Footer from "../components/footer"

function Profile() {
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex justify-center items-center">
          <div className="flex flex-col items-center space-y-4">
            <h1 className="text-3xl font-black text-black">
              Profile
            </h1>
          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}

export default Profile
