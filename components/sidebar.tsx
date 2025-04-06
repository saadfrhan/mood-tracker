"use client";

import {
  BarChart3,
  BookOpen,
  Calendar,
  Cherry,
  Home,
  PanelLeft,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";

const navItems = [
  {
    name: "ホーム",
    href: "/",
    icon: Home,
  },
  {
    name: "日記",
    href: "/journal",
    icon: BookOpen,
  },
  {
    name: "カレンダー",
    href: "/calendar",
    icon: Calendar,
  },
  {
    name: "統計",
    href: "/stats",
    icon: BarChart3,
  },
  // {
  //   name: "設定",
  //   href: "/settings",
  //   icon: Settings,
  // },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem("sidebar-collapsed");
    if (savedState) {
      setCollapsed(savedState === "true");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", collapsed.toString());
  }, [collapsed]);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-[#e7e0d8] bg-white transition-width duration-300 h-dvh overflow-hidden sticky top-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <nav className="flex-1 pb-6">
        <ul className="space-y-1 px-2 mt-4">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 p-3 text-sm rounded-md transition-colors",
              collapsed ? "justify-center" : "justify-start"
            )}
          >
            <Cherry className="w-5 h-5 text-pink-400" />
            {!collapsed && (
              <h2
                className={cn(
                  "text-lg font-semibold",
                  collapsed ? "invisible w-0" : "visible w-auto"
                )}
              >
                気分トラッカー
              </h2>
            )}
          </Link>
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 p-3 text-sm rounded-md transition-colors",
                  pathname === item.href
                    ? "bg-pink-50 text-pink-700"
                    : "text-[#5d5a55] hover:bg-[#f8f6f2]",
                  collapsed ? "justify-center" : "justify-start"
                )}
                title={collapsed ? item.name : undefined}
              >
                <item.icon className="w-5 h-5" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Collapse toggle button at the bottom */}
      <div className="p-2 border-t border-[#e7e0d8]">
        <Button
          variant="ghost"
          size="icon"
          className="w-full justify-center"
          onClick={() => setCollapsed(!collapsed)}
        >
          <PanelLeft
            className={cn(
              "transition-transform duration-200",
              collapsed ? "rotate-180" : "rotate-0"
            )}
          />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>
    </aside>
  );
}
