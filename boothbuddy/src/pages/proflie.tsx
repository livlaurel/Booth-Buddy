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
        {/* MY STRIPS TAB */}
        <section className="mt-4 flex justify-center">
          <div className="inline-flex gap-6 border-b border-gray-200">
            <button
              type="button"
              className="pb-2 text-sm sm:text-base font-medium text-black border-b-2 border-black"
            >
              My Strips
            </button>
          </div>
        </section>
        {/* STRIPS GRID (mock for now) */}
        <section className="mt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {/* Temporary mock thumbnails */}
            {[1, 2, 3, 4, 5, 6].map((id) => (
              <div
                key={id}
                className="bg-white shadow-md rounded-2xl border border-gray-200 hover:shadow-xl hover:-translate-y-0.5 transition p-2 cursor-pointer"
              >
                <div className="w-full h-40 overflow-hidden rounded-xl bg-gray-50">
                  <img
                    src="/placeholderr-strip.png"
                    alt="Strip preview"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}