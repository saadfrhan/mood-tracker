"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Cherry, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { UserNav } from "@/components/user-nav";

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const renderCalendarDays = () => {
    const days = [];
    const daysOfWeek = [
      "日",
      "月",
      "火",
      "水",
      "木",
      "金",
      "土",
    ]; /* English: Sun, Mon, Tue, Wed, Thu, Fri, Sat */

    // Render days of week
    for (let i = 0; i < 7; i++) {
      days.push(
        <div
          key={`header-${i}`}
          className="text-center text-xs font-medium text-muted-foreground py-2"
        >
          {daysOfWeek[i]}
        </div>
      );
    }

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-1"></div>);
    }

    // Render days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        <div key={`day-${day}`} className="p-1">
          <div className="aspect-square rounded-full flex flex-col items-center justify-center border border-[#e7e0d8] hover:bg-pink-50 cursor-pointer transition-colors">
            <div className="text-xs">{day}</div>
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="min-h-screen bg-[#f8f6f2]">
      <div className="flex-1 flex flex-col">
        <header className="border-b border-[#e7e0d8] bg-white/50 backdrop-blur-sm sticky top-0 z-10 h-16">
          <div className="container flex items-center justify-between h-full px-4 md:px-6">
            <div className="flex items-center gap-2 md:hidden">
              <Cherry className="w-5 h-5 text-pink-400" />
              <span className="text-lg font-medium text-[#5d5a55]">
                こころ日記
              </span>{" "}
              {/* English: Heart Diary */}
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-medium text-[#5d5a55]">
                ダッシュボード
              </h1>{" "}
              {/* English: Dashboard */}
            </div>
            <div className="flex items-center gap-4">
              <UserNav />
            </div>
          </div>
        </header>

        <main className="flex-1 container py-8 px-4 md:px-6 max-w-6xl">
          <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-[#5d5a55]">カレンダー</CardTitle>{" "}
                {/* English: Calendar */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={prevMonth}
                    className="h-8 w-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    {currentMonth.getFullYear()}年 {currentMonth.getMonth() + 1}
                    月
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={nextMonth}
                    className="h-8 w-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>毎日の気分を記録しましょう</CardDescription>{" "}
              {/* English: Let's record your daily mood */}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {renderCalendarDays()}
              </div>
            </CardContent>
          </Card>
        </main>

        <MobileNav />
      </div>
    </div>
  );
}
