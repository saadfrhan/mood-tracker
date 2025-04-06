"use client"

import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

// Define the routes in order for swiping
const routes = ["/", "/journal", "/stats", "/settings"]

export function SwipeIndicator() {
  const pathname = usePathname()
  const currentIndex = routes.indexOf(pathname)

  if (currentIndex === -1) return null

  return (
    <div className="md:hidden fixed bottom-20 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-10">
      {routes.map((route, index) => (
        <div
          key={route}
          className={cn(
            "w-1.5 h-1.5 rounded-full transition-all duration-300",
            index === currentIndex ? "bg-pink-500 w-3" : "bg-gray-300",
          )}
        />
      ))}
    </div>
  )
}

