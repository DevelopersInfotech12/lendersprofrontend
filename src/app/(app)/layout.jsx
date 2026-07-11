import Sidebar from "@/components/layout/Sidebar";

export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 md:ml-64 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-8 md:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
