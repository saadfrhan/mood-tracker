"use client";

import {
  BarChart3,
  BookOpen,
  Calendar,
  Cherry,
  Home,
  PanelLeft,
  Settings,
  LogOut,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { signOut } from "next-auth/react";
import { Separator } from "./ui/separator";

// Define navigation items with their properties
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
];

// Define bottom action items
const bottomActions = [
  {
    name: "フィードバック",
    icon: MessageSquare,
    action: () => window.open("https://tally.so/r/w7Ey5L", "_blank"),
  },
  {
    name: "ログアウト",
    icon: LogOut,
    action: () => signOut(),
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load saved sidebar state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("sidebar-collapsed");
    if (savedState) {
      setCollapsed(savedState === "true");
    }
  }, []);

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", collapsed.toString());
  }, [collapsed]);

  // Toggle sidebar collapsed state
  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  // Don't render anything until after hydration to prevent flashing
  if (!mounted) {
    return null;
  }

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300 ease-in-out h-dvh overflow-hidden sticky top-0 z-30",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header with app logo */}
      <div className="flex h-14 items-center border-b px-4">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2 font-semibold transition-all duration-300 ease-in-out",
            collapsed ? "justify-center w-full" : "justify-start"
          )}
        >
          <Cherry className="h-6 w-6 text-pink-500" />
          <span
            className={cn(
              "text-lg font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent transition-all duration-300 ease-in-out",
              collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
            )}
          >
            こころ日記
          </span>
        </Link>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 text-sm rounded-md transition-all duration-300 ease-in-out",
                    isActive
                      ? "bg-pink-50 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    collapsed
                      ? "justify-center p-2 w-12 h-12"
                      : "justify-start p-3 w-auto"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-6 w-6 transition-transform duration-300 ease-in-out flex-shrink-0",
                      isActive && "scale-110"
                    )}
                  />
                  <span
                    className={cn(
                      "transition-all duration-300 ease-in-out",
                      collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
                    )}
                  >
                    {item.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom actions */}
      <div className="mt-auto border-t p-4">
        <div className="flex items-center gap-2">
          {!collapsed ? (
            <>
              {/* Collapse button */}
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground w-12 h-12"
                onClick={toggleCollapsed}
              >
                <PanelLeft
                  className={cn(
                    "h-6 w-6 transition-transform duration-300 ease-in-out",
                    collapsed ? "rotate-180" : "rotate-0"
                  )}
                />
                <span className="sr-only">Toggle Sidebar</span>
              </Button>

              {/* Feedback button */}
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground w-12 h-12"
                onClick={bottomActions[0].action}
              >
                <MessageSquare className="h-6 w-6" />
                <span className="sr-only">{bottomActions[0].name}</span>
              </Button>

              {/* Logout button */}
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground w-12 h-12"
                onClick={bottomActions[1].action}
              >
                <LogOut className="h-6 w-6" />
                <span className="sr-only">{bottomActions[1].name}</span>
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground w-12 h-12"
              onClick={toggleCollapsed}
            >
              <PanelLeft
                className={cn(
                  "h-6 w-6 transition-transform duration-300 ease-in-out",
                  collapsed ? "rotate-180" : "rotate-0"
                )}
              />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}
