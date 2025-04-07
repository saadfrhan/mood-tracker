import type React from "react";
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { SidebarProvider } from "@/components/ui/sidebar";

// Wrap the content with SwipeNavigation
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f8f6f2] flex">
      <SidebarProvider>
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <MobileNav />
        </div>
      </SidebarProvider>
    </div>
  );
}
