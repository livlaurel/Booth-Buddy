import Header from "../../components/header";
import Footer from "../../components/footer";

export default function EditProfilePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-1 flex justify-center px-4 sm:px-8 lg:px-16 py-10">
        <div className="w-full max-w-2xl">
            {/* TITLE + DESCRIPTION */}
            <h1 className="text-3xl font-bold">Edit profile</h1>
            <p className="text-gray-600 mt-1 mb-8">
            Keep your personal details private.
            </p>

            {/* PROFILE PHOTO SECTION */}
            <div className="flex items-center gap-6 mb-10">
                <img
                    src="/default-avatarr.jpg"
                    alt="Profile avatar"
                    className="w-20 h-20 rounded-full object-cover bg-gray-200 border border-gray-300"
                />

                <label className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 border border-gray-300 cursor-pointer hover:bg-gray-200">
                    Change
                    <input type="file" accept="image/*" className="hidden" />
                </label>
            </div>
            {/* EMAIL FIELD */}
            <div className="mb-10">
                <div className="text-center mb-2">
                    <label className="text-sm font-semibold text-gray-700">Email</label>
                </div>

                <div className="border border-gray-300 rounded-3xl px-6 py-4 bg-gray-100">
                    <input
                    type="text"
                    value={"user@example.com"}  // will populate later
                    disabled
                    className="w-full text-lg font-semibold text-gray-500 focus:outline-none bg-gray-100 cursor-not-allowed"
                    />
                </div>
            </div>

            {/* USERNAME FIELD */}
            <div className="mb-10">
                <div className="text-center mb-2">
                    <label className="text-sm font-semibold text-gray-700">Username</label>
                </div>

                <div className="border border-gray-300 rounded-3xl px-6 py-4">
                    <input
                    type="text"
                    value={"abcde"}  // will make dynamic later
                    onChange={() => {}}
                    className="w-full text-lg font-semibold focus:outline-none"
                    />
                </div>

                <p className="text-gray-500 text-xs mt-1">
                    www.boothbuddy.com/abcde
                </p>
            </div>
            {/* ACTION BUTTONS */}
            <div className="flex justify-end gap-3 mt-12">
                <button
                    type="button"
                    className="px-5 py-2 rounded-full bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200"
                >
                    Reset
                </button>

                <button
                    type="button"
                    className="px-6 py-2 rounded-full bg-[#e15c31] text-white hover:bg-[#ff9573]"
                >
                    Save
                </button>
            </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
