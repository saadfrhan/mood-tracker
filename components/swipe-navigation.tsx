"use client";

import type React from "react";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// Define the routes in order for swiping
const routes = ["/", "/journal", "/calendar", "/stats"];

export function SwipeNavigation({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50; // Minimum distance required for a swipe
  const [isSwiping, setIsSwiping] = useState(false);

  // Handle touch start
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  // Handle touch move
  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStartX.current) return;

    const currentX = e.targetTouches[0].clientX;
    const diff = touchStartX.current - currentX;

    // If the user is swiping more than 10px, consider it a swipe
    if (Math.abs(diff) > 10) {
      setIsSwiping(true);
    }
  };

  // Handle touch end
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current || !isSwiping) {
      setIsSwiping(false);
      return;
    }

    touchEndX.current = e.changedTouches[0].clientX;

    // Calculate the distance of the swipe
    const distance = touchStartX.current - touchEndX.current;

    // If the distance is greater than the minimum swipe distance, navigate
    if (Math.abs(distance) > minSwipeDistance) {
      const currentIndex = routes.indexOf(pathname);

      if (currentIndex !== -1) {
        // Swipe left (next page)
        if (distance > 0 && currentIndex < routes.length - 1) {
          router.push(routes[currentIndex + 1]);
        }
        // Swipe right (previous page)
        else if (distance < 0 && currentIndex > 0) {
          router.push(routes[currentIndex - 1]);
        }
      }
    }

    // Reset
    touchStartX.current = null;
    touchEndX.current = null;
    setIsSwiping(false);
  };

  // Add a class to prevent scrolling when swiping
  useEffect(() => {
    if (isSwiping) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isSwiping]);

  return (
    <div
      className="md:touch-none touch-pan-y h-full w-full"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {children}
    </div>
  );
}
