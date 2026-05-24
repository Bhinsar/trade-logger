"use client";

import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { navSections } from "@/src/types/navItems";
import Tooltip from "@/src/components/common/tooltip";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutUser } from "@/src/actions/users/user";
import { UserInfo } from "@/src/actions/users/users.interface";
import { useSidebar } from "@/src/components/common/sidebarContext";

export default function SideBar() {
  const [collapsed, setCollapsed] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const { mobileOpen, setMobileOpen } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileOpen(false);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [setMobileOpen]);

  async function handleSignOut() {
    setSigningOut(true);
    await signOutUser();
  }

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "flex flex-col h-screen bg-background-secondary border-r border-background-border transition-all duration-300 ease-in-out",
          // Desktop styles
          "md:relative md:translate-x-0 md:z-auto",
          collapsed ? "md:w-[60px]" : "md:w-[240px]",
          // Mobile styles
          "fixed inset-y-0 left-0 z-50 w-[240px]",
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        )}
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-3 py-3 border-b border-background-border">
          <div
            className={cn(
              "flex items-center gap-2.5 overflow-hidden transition-all duration-300",
              (collapsed && !isMobile) ? "w-0 opacity-0" : "w-full opacity-100",
            )}
          >
            {/* Logo mark */}
            <div className="shrink-0 size-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <TrendingUp size={14} className="text-white" />
            </div>
            <span className="text-sm font-semibold whitespace-nowrap tracking-tight">
              Trade Logger
            </span>
          </div>

          {/* Collapse/Close toggle */}
          <button
            id="sidebar-toggle"
            onClick={() => {
              if (isMobile) {
                setMobileOpen(false);
              } else {
                setCollapsed((c) => !c);
              }
            }}
            className={cn(
              "shrink-0 flex items-center justify-center",
              "size-7 rounded-lg",
              "hover:bg-background-secondary hover:text-[#c8ccd8]",
              "transition-colors duration-150 cursor-pointer",
            )}
            aria-label={isMobile ? "Close sidebar" : collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isMobile ? (
              <X size={15} />
            ) : collapsed ? (
              <PanelLeftOpen size={15} />
            ) : (
              <PanelLeftClose size={15} />
            )}
          </button>
        </div>

        {/* ── Nav Sections ───────────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-1 space-y-0.5 scrollbar-thin">
          {navSections.map((item) => {
            const isActive = usePathname() === item.href;
            return (
              <Tooltip key={item.id} label={item.label} show={collapsed && !isMobile}>
                <Link
                  id={`nav-${item.id}`}
                  href={item.href ?? "#"}
                  onClick={() => {
                    if (isMobile) setMobileOpen(false);
                  }}
                  className={cn(
                    "group relative flex items-center gap-2.5 w-full rounded-lg px-2 py-2 cursor-pointer",
                    "text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-[#0d2b20] text-emerald-400 shadow-sm"
                      : "text-[#6b7094] hover:bg-[#1a1c2a] hover:text-[#c8ccd8]",
                    (collapsed && !isMobile) && "justify-center px-0",
                  )}
                >
                  {/* Active indicator bar */}
                  <span
                    className={cn(
                      "absolute left-0 w-0.5 h-5 rounded-r-full transition-all duration-200",
                      isActive ? "bg-emerald-500 opacity-100" : "opacity-0",
                    )}
                  />

                  {/* Icon */}
                  <span
                    className={cn(
                      "shrink-0 transition-colors duration-150",
                      isActive
                        ? "text-emerald-400"
                        : "text-[#6b7094] group-hover:text-[#c8ccd8]",
                    )}
                  >
                    {item.icon}
                  </span>

                  {/* Label + Badge */}
                  {(!collapsed || isMobile) && (
                    <>
                      <span className="flex-1 text-left truncate">
                        {item.label}
                      </span>
                      {item.badge !== undefined && (
                        <span
                          className={cn(
                            "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                            isActive
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-[#22253a] text-[#6b7094]",
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              </Tooltip>
            );
          })}
        </nav>

        {/* ── Divider ────────────────────────────────────────────────── */}
        <div className="mx-2 border-t border-[#1e2030]" />

        {/* ── User Profile + Sign Out ─────────────────────────────────── */}
        <div className="border-t border-[#1e2030] px-2 py-2">
          {/* Sign-out button */}
          <Tooltip label="Sign out" show={collapsed && !isMobile}>
            <button
              id="sidebar-signout"
              onClick={handleSignOut}
              disabled={signingOut}
              className={cn(
                "group flex items-center gap-2.5 w-full rounded-lg px-2 py-2 mt-0.5",
                "text-sm font-medium text-[#6b7094]",
                "hover:bg-red-500/10 hover:text-red-400",
                "transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed",
                (collapsed && !isMobile) && "justify-center px-0",
              )}
            >
              {signingOut ? (
                <Loader2 size={15} className="shrink-0 animate-spin" />
              ) : (
                <LogOut size={15} className="shrink-0" />
              )}
              {(!collapsed || isMobile) && (
                <span>{signingOut ? "Signing out…" : "Sign out"}</span>
              )}
            </button>
          </Tooltip>
        </div>
      </aside>
    </>
  );
}
