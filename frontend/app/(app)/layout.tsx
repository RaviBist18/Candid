import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="mx-auto max-w-6xl px-6 pt-4 pb-10 flex flex-col gap-6 flex-1 w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
}
