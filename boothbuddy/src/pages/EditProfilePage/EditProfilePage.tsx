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
        </div>
      </main>

      <Footer />
    </div>
  );
}
