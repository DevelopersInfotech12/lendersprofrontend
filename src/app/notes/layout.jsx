import Sidebar from "@/components/layout/Sidebar";

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-white dark:bg-[#0d0c0a]">
      <Sidebar />
      <main className="flex-1 md:ml-64 min-h-screen overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
