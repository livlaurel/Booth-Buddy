import Header from "../components/header";
import Footer from "../components/footer";

export default function ProfilePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 px-4 sm:px-8 lg:px-16 pb-12">
        {/* PROFILE HEADER */}
        <section className="flex flex-col items-center text-center pt-10 pb-8 border-b border-gray-200">
          <img
            src="/default-avatarr.jpg"
            alt="Profile avatar"
            className="w-28 h-28 rounded-full object-cover border-4 border-orange-400 shadow-md"
          />

          <h1 className="mt-4 text-3xl sm:text-4xl font-black">
            Username Here
          </h1>

          <p className="mt-1 text-sm sm:text-base text-gray-500">
            user@example.com
          </p>

          {/* Action buttons */}
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              className="px-4 py-2 rounded-full border border-gray-300 text-sm font-medium hover:bg-gray-100"
            >
              Share Profile
            </button>

            <button
              type="button"
              className="px-4 py-2 rounded-full bg-[#e15c31] text-white text-sm font-medium hover:bg-[#ff9573]"
            >
              Edit Profile
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}