"use client";

import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UserAvatar() {
  const { data: session } = useSession();

  if (!session?.user) {
    return (
      <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-700">
        ゲ
      </div> /* English: First letter of "guest" in Japanese */
    );
  }

  const initials = session.user.name
    ? session.user.name.charAt(0)
    : "ユ"; /* English: First letter of "user" in Japanese */

  return (
    <Avatar className="w-8 h-8 border border-[#e7e0d8] cursor-pointer">
      <AvatarImage
        src={session.user.image || ""}
        alt={session.user.name || "User"}
      />
      <AvatarFallback className="bg-pink-50 text-pink-700">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
