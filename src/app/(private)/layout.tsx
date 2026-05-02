import SideBar from "@/src/components/sideBar";
import { getUserInfo } from "@/src/actions/user";

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="flex h-screen bg-zinc-950">
      <SideBar />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}