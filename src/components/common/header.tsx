"use client";
import React, { useEffect, useState } from "react";
import { getUserInfo } from "@/src/actions/users/user";
import { cn } from "@/src/lib/utils";
import Image from "next/image";
import { StockTicker } from "./stock-ticker";
import { UserInfo } from "@/src/actions/users/users.interface";
import { Menu } from "lucide-react";
import { useSidebar } from "./sidebarContext";

function Header({ title }: { title: string }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const { setMobileOpen } = useSidebar();

  useEffect(() => {
    getUserInfo().then((data) => {
      setUser(data);
    });
  }, []);
  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : (user?.name ?? "Trader");

  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="flex flex-col w-full sticky top-0 z-10 shadow-sm">
      
      <div className="flex justify-between items-center px-4 py-3 bg-background-secondary border-b border-background-border">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden flex items-center justify-center p-1.5 rounded-lg text-[#6b7094] hover:bg-background-secondary hover:text-[#c8ccd8] transition-colors cursor-pointer"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-2xl font-semibold">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex items-center gap-2.5 w-full rounded-lg px-2 py-2",
            )}
          >
            {/* Avatar — use Google picture when available */}
            {user?.image ? (
              <div className="shrink-0 size-7 rounded-full overflow-hidden ring-1 ring-emerald-500/30">
                <Image
                  src={user.image}
                  alt={displayName}
                  width={28}
                  height={28}
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <div className="shrink-0 size-7 rounded-full bg-linear-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white text-[10px] font-bold shadow-md shadow-emerald-500/20">
                {initials || "T"}
              </div>
            )}

            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-semibold text-[#c8ccd8] truncate">
                {displayName}
              </p>
            </div>
          </div>
        </div>
      </div>
      <StockTicker />
    </div>
  );
}

export default Header;
