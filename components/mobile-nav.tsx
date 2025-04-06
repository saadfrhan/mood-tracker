"use client";

import { BarChart3, BookOpen, Calendar, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  {
    name: "ホーム" /* English: Home */,
    href: "/",
    icon: Home,
  },
  {
    name: "日記" /* English: Journal */,
    href: "/journal",
    icon: BookOpen,
  },
  {
    name: "カレンダー" /* English: Calendar */,
    href: "/calendar",
    icon: Calendar,
  },
  {
    name: "統計" /* English: Statistics */,
    href: "/stats",
    icon: BarChart3,
  },
  // {
  //   name: "設定" /* English: Settings */,
  //   href: "/settings",
  //   icon: Settings,
  // },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden border-t border-[#e7e0d8] bg-white py-2 sticky bottom-0">
      <div className="container flex justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1"
            >
              <div
                className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-full",
                  isActive ? "bg-pink-50 text-pink-700" : "text-[#5d5a55]"
                )}
              >
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-xs">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
