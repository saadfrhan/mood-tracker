import type React from "react";
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
// Import the SwipeNavigation component
import { SwipeNavigation } from "@/components/swipe-navigation";
import { SwipeIndicator } from "@/components/swipe-indicator";
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
          <SwipeNavigation>{children}</SwipeNavigation>
          <SwipeIndicator />
          <MobileNav />
        </div>
      </SidebarProvider>
    </div>
  );
}
