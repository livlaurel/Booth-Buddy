import Header from "../../components/header";
import Footer from "../../components/footer";

export default function EditProfilePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-1 flex justify-center px-4 sm:px-8 lg:px-16 py-10">
        <div className="w-full max-w-2xl">
          {/* Content will go here */}
        </div>
      </main>

      <Footer />
    </div>
  );
}
