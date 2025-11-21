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
        </div>
      </main>

      <Footer />
    </div>
  );
}
