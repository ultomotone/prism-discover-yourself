import { InfoElementSidebar } from "@/components/InfoElementSidebar";
import Header from "@/components/Header";

interface InfoElementLayoutProps {
  children: React.ReactNode;
}

export default function InfoElementLayout({ children }: InfoElementLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="relative">
        {children}
        <InfoElementSidebar />
      </div>
    </div>
  );
}