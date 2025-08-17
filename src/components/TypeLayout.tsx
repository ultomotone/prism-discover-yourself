import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TypeSidebar } from "@/components/TypeSidebar";
import Header from "@/components/Header";

interface TypeLayoutProps {
  children: React.ReactNode;
}

export default function TypeLayout({ children }: TypeLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SidebarProvider>
        <div className="pt-16 w-full flex min-h-[calc(100vh-4rem)]">
          <TypeSidebar />
          <main className="flex-1 overflow-auto">
            <div className="p-4 sm:p-6">
              <SidebarTrigger className="mb-4 md:hidden" />
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}