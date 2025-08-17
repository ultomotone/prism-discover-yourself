import { TypeSidebar } from "@/components/TypeSidebar";
import Header from "@/components/Header";

interface TypeLayoutProps {
  children: React.ReactNode;
}

export default function TypeLayout({ children }: TypeLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16 relative">
        <main className="w-full">
          <div className="p-4 sm:p-6 max-w-5xl mx-auto">
            {children}
          </div>
        </main>
        <TypeSidebar />
      </div>
    </div>
  );
}