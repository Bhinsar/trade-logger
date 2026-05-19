import SideBar from "@/src/components/common/sideBar";
import { SidebarProvider } from "@/src/components/common/sidebarContext";

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background-primary overflow-hidden">
        <SideBar />
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </SidebarProvider>
  );
}
