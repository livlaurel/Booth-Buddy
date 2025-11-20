import Header from "../components/header";
import Footer from "../components/footer";

export default function ProfilePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 px-4 sm:px-8 lg:px-16 pb-12">
        {/* Profile Page */}
        <div className="pt-10 text-center text-gray-500">
          Loading profile...
        </div>
      </main>

      <Footer />
    </div>
  );
}