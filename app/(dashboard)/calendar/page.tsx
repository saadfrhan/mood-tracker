import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Cherry,
  ChevronLeft,
  ChevronRight,
  Sun,
  CloudSun,
  Cloud,
  Cloudy,
  Droplets,
  Tag,
  Calendar as CalendarIcon,
  ArrowLeft,
} from "lucide-react";
import { UserNav } from "@/components/user-nav";
import { prisma } from "@/lib/prisma";
import { format, isSameDay, startOfMonth, endOfMonth } from "date-fns";
import { ja } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { Metadata } from "next";
import { createElement } from "react";

// Define mood types and their corresponding icons and colors
const moods = [
  {
    icon: Sun,
    label: "最高", // Excellent
    color: "text-amber-500",
    bgColor: "bg-amber-50",
    hoverBg: "hover:bg-amber-100",
  },
  {
    icon: CloudSun,
    label: "良い", // Good
    color: "text-sky-400",
    bgColor: "bg-sky-50",
    hoverBg: "hover:bg-sky-100",
  },
  {
    icon: Cloud,
    label: "普通", // Normal
    color: "text-gray-400",
    bgColor: "bg-gray-50",
    hoverBg: "hover:bg-gray-100",
  },
  {
    icon: Cloudy,
    label: "少し悪い", // Slightly Bad
    color: "text-indigo-400",
    bgColor: "bg-indigo-50",
    hoverBg: "hover:bg-indigo-100",
  },
  {
    icon: Droplets,
    label: "悪い", // Bad
    color: "text-purple-400",
    bgColor: "bg-purple-50",
    hoverBg: "hover:bg-purple-100",
  },
];

// Enhanced metadata for better SEO
export const metadata: Metadata = {
  title: "気分カレンダー | こころ日記",
  description:
    "毎日の気分を記録して、あなたの心の健康を管理しましょう。気分の変化を視覚的に追跡し、パターンを発見できます。",
  keywords:
    "気分トラッカー, メンタルヘルス, 日記, カレンダー, 感情記録, 心の健康",
  openGraph: {
    title: "気分カレンダー | こころ日記",
    description: "毎日の気分を記録して、あなたの心の健康を管理しましょう。",
    type: "website",
    locale: "ja_JP",
    siteName: "こころ日記",
  },
  twitter: {
    card: "summary_large_image",
    title: "気分カレンダー | こころ日記",
    description: "毎日の気分を記録して、あなたの心の健康を管理しましょう。",
  },
  alternates: {
    canonical: "https://kokoro-diary.com/calendar",
  },
};

export const revalidate = 3600; // Revalidate every hour

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string; day?: string }>;
}) {
  const session = await getSession();

  if (!session?.user?.email) {
    return (
      <div className="min-h-screen bg-[#f8f6f2] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-[#5d5a55] mb-4">
            ログインが必要です
          </h1>
          <p className="text-muted-foreground mb-6">
            カレンダーを表示するにはログインしてください。
          </p>
          <Link href="/login">
            <Button className="bg-pink-400 hover:bg-pink-500 text-white">
              ログイン
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const searchPrms = await searchParams;

  // Get current date or use searchParams
  const today = new Date();
  const year = searchPrms.year
    ? parseInt(searchPrms.year)
    : today.getFullYear();
  const month = searchPrms.month
    ? parseInt(searchPrms.month) - 1
    : today.getMonth();
  const selectedDay = searchPrms.day ? parseInt(searchPrms.day) : null;

  const currentMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // Calculate start and end dates for the month
  const startDate = startOfMonth(currentMonth);
  const endDate = endOfMonth(currentMonth);

  // Fetch mood entries for the current month
  const moodEntries = await prisma.moodEntry.findMany({
    where: {
      user: {
        email: session.user.email,
      },
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      id: true,
      date: true,
      moodValue: true,
      note: true,
      tags: true,
    },
  });

  // Convert to a format indexed by day for easy lookup
  const entriesByDay: Record<string, any> = {};
  moodEntries.forEach((entry) => {
    const day = entry.date.getDate();
    entriesByDay[day] = entry;
  });

  // Fetch selected day's mood if a day is selected
  let selectedMoodDetails = null;
  if (selectedDay) {
    const selectedDate = new Date(year, month, selectedDay);
    selectedMoodDetails = await prisma.moodEntry.findFirst({
      where: {
        user: {
          email: session.user.email,
        },
        date: {
          gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
          lt: new Date(selectedDate.setHours(23, 59, 59, 999)),
        },
      },
      select: {
        id: true,
        date: true,
        moodValue: true,
        note: true,
        tags: true,
      },
    });
  }

  // Generate navigation URLs
  const prevMonthUrl = `/calendar?year=${month === 0 ? year - 1 : year}&month=${
    month === 0 ? 12 : month
  }`;
  const nextMonthUrl = `/calendar?year=${
    month === 11 ? year + 1 : year
  }&month=${month === 11 ? 1 : month + 2}`;

  // URL to clear selected day (go back to calendar view on mobile)
  const clearSelectedDayUrl = `/calendar?year=${year}&month=${month + 1}`;

  // Render calendar days
  const renderCalendarDays = () => {
    const days = [];
    const daysOfWeek = ["日", "月", "火", "水", "木", "金", "土"];

    // Render days of week
    for (let i = 0; i < 7; i++) {
      days.push(
        <div
          key={`header-${i}`}
          className="text-center text-xs font-medium text-muted-foreground py-2"
          role="columnheader"
          aria-label={daysOfWeek[i]}
        >
          {daysOfWeek[i]}
        </div>
      );
    }

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div key={`empty-${i}`} className="p-1" aria-hidden="true"></div>
      );
    }

    // Render days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = isSameDay(date, new Date());
      const isSelected = selectedDay === day;
      const hasMood = entriesByDay[day];

      let moodIcon = null;
      if (hasMood) {
        const MoodIcon = moods[hasMood.moodValue].icon;
        moodIcon = (
          <MoodIcon className={`w-4 h-4 ${moods[hasMood.moodValue].color}`} />
        );
      }

      days.push(
        <div key={`day-${day}`} className="p-1">
          {hasMood ? (
            <Link
              href={`/calendar?year=${year}&month=${month + 1}&day=${day}`}
              aria-label={`${year}年${month + 1}月${day}日の気分: ${
                moods[hasMood.moodValue].label
              }`}
            >
              <div
                className={`aspect-square rounded-full flex flex-col items-center justify-center transition-colors
                  ${
                    isToday
                      ? "border-2 border-pink-400"
                      : "border border-[#e7e0d8]"
                  }
                  ${isSelected ? "bg-pink-50" : ""}
                  ${
                    moods[hasMood.moodValue].bgColor
                  } cursor-pointer hover:bg-pink-50
                `}
                role="button"
                aria-current={isToday ? "date" : undefined}
                aria-selected={isSelected ? "true" : "false"}
              >
                <div className="text-xs mb-1">{day}</div>
                {moodIcon}
              </div>
            </Link>
          ) : (
            <div
              className={`aspect-square rounded-full flex flex-col items-center justify-center transition-colors
                ${
                  isToday
                    ? "border-2 border-pink-400"
                    : "border border-[#e7e0d8]"
                }
                ${isSelected ? "bg-pink-50" : ""}
                bg-gray-50 cursor-not-allowed opacity-50
              `}
              role="button"
              aria-current={isToday ? "date" : undefined}
              aria-disabled="true"
              aria-label={`${year}年${month + 1}月${day}日 - 記録なし`}
            >
              <div className="text-xs mb-1">{day}</div>
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  // Generate structured data for SEO
  const generateStructuredData = () => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "気分カレンダー | こころ日記",
      description: "毎日の気分を記録して、あなたの心の健康を管理しましょう。",
      url: "https://kokoro-diary.com/calendar",
      inLanguage: "ja-JP",
      isPartOf: {
        "@type": "WebSite",
        name: "こころ日記",
        url: "https://kokoro-diary.com",
      },
    };

    return JSON.stringify(structuredData);
  };

  return (
    <div className="min-h-screen bg-[#f8f6f2]">
      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: generateStructuredData() }}
      />

      <div className="flex-1 flex flex-col">
        <header className="border-b border-[#e7e0d8] bg-white/50 backdrop-blur-sm sticky top-0 z-10 h-14">
          <div className="container flex items-center justify-between h-full px-4 md:px-6">
            <div className="flex items-center gap-2">
              <Cherry className="w-5 h-5 text-pink-400" aria-hidden="true" />
              <span className="text-lg font-medium text-[#5d5a55]">
                こころ日記
              </span>
            </div>
            <div className="flex items-center gap-4">
              <UserNav />
            </div>
          </div>
        </header>

        <main className="flex-1 container py-6 px-4 md:px-6 max-w-8xl mx-auto">
          {/* Mobile View - Show either calendar or mood details */}
          <div className="block lg:hidden">
            {selectedDay && selectedMoodDetails ? (
              <div className="space-y-4">
                {/* Mobile header with back button */}
                <div className="flex items-center gap-2 mb-4">
                  <Link href={clearSelectedDayUrl}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      aria-label="カレンダーに戻る"
                    >
                      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </Link>
                  <h2 className="text-lg font-medium text-[#5d5a55]">
                    {format(new Date(year, month, selectedDay), "MM月dd日", {
                      locale: ja,
                    })}
                  </h2>
                </div>

                {/* Mood details card for mobile */}
                <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm overflow-hidden">
                  <div className="relative">
                    {/* Decorative header with mood color */}
                    <div
                      className={`h-20 w-full ${
                        moods[selectedMoodDetails.moodValue].bgColor
                      } flex items-center justify-center`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/20"></div>
                      <div className="relative z-10 flex flex-col items-center">
                        <div
                          className={`w-14 h-14 rounded-full bg-white/90 shadow-md flex items-center justify-center mb-1`}
                        >
                          {createElement(
                            moods[selectedMoodDetails.moodValue].icon,
                            {
                              className: `w-7 h-7 ${
                                moods[selectedMoodDetails.moodValue].color
                              }`,
                              "aria-hidden": "true",
                            }
                          )}
                        </div>
                      </div>
                    </div>

                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        {/* Mood visualization */}
                        <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50">
                          <span className="text-sm font-medium text-gray-500">
                            気分レベル
                          </span>
                          <div
                            className="flex items-center gap-1"
                            aria-label={`気分レベル: ${
                              selectedMoodDetails.moodValue + 1
                            }/5`}
                          >
                            {moods[selectedMoodDetails.moodValue].label}
                          </div>
                        </div>

                        {/* Note section with better styling */}
                        {selectedMoodDetails.note && (
                          <div className="space-y-1">
                            <h4 className="text-sm font-medium text-gray-500">
                              メモ
                            </h4>
                            <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                              <p className="text-sm whitespace-pre-wrap">
                                {selectedMoodDetails.note}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Tags with improved styling */}
                        {selectedMoodDetails.tags &&
                          selectedMoodDetails.tags.length > 0 && (
                            <div className="space-y-1">
                              <h4 className="text-sm font-medium text-gray-500">
                                タグ
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedMoodDetails.tags.map(
                                  (tag: string, index: number) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className={`${
                                        moods[selectedMoodDetails.moodValue]
                                          .bgColor
                                      } ${moods[
                                        selectedMoodDetails.moodValue
                                      ].color.replace(
                                        "text",
                                        "border"
                                      )} border-2`}
                                    >
                                      <Tag
                                        className="w-3 h-3 mr-1"
                                        aria-hidden="true"
                                      />
                                      {tag}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarIcon
                        className="w-5 h-5 text-pink-400"
                        aria-hidden="true"
                      />
                      <CardTitle className="text-[#5d5a55] text-xl">
                        カレンダー
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={prevMonthUrl} aria-label="前の月">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 justify-center"
                        >
                          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </Link>
                      <span className="text-sm font-medium min-w-[100px] text-center">
                        {year}年 {month + 1}月
                      </span>
                      <Link href={nextMonthUrl} aria-label="次の月">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 justify-center"
                        >
                          <ChevronRight
                            className="h-4 w-4"
                            aria-hidden="true"
                          />
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <CardDescription>毎日の気分を記録しましょう</CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className="grid grid-cols-7 gap-1"
                    role="grid"
                    aria-label={`${year}年${month + 1}月のカレンダー`}
                  >
                    {renderCalendarDays()}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Desktop View - Side by side layout */}
          <div className="hidden lg:grid grid-cols-3 gap-6">
            {/* Calendar Section */}
            <div className="col-span-2">
              <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarIcon
                        className="w-5 h-5 text-pink-400"
                        aria-hidden="true"
                      />
                      <CardTitle className="text-[#5d5a55] text-xl">
                        カレンダー
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={prevMonthUrl} aria-label="前の月">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </Link>
                      <span className="text-sm font-medium min-w-[100px] text-center">
                        {year}年 {month + 1}月
                      </span>
                      <Link href={nextMonthUrl} aria-label="次の月">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <ChevronRight
                            className="h-4 w-4"
                            aria-hidden="true"
                          />
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <CardDescription>毎日の気分を記録しましょう</CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className="grid grid-cols-7 gap-2"
                    role="grid"
                    aria-label={`${year}年${month + 1}月のカレンダー`}
                  >
                    {renderCalendarDays()}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mood Details Section */}
            <div className="col-span-1">
              {selectedDay && selectedMoodDetails ? (
                <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm overflow-hidden sticky top-20">
                  <div className="relative">
                    {/* Decorative header with mood color */}
                    <div
                      className={`h-24 w-full ${
                        moods[selectedMoodDetails.moodValue].bgColor
                      } flex items-center justify-center`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/20"></div>
                      <div className="relative z-10 flex flex-col items-center">
                        <div
                          className={`w-16 h-16 rounded-full bg-white/90 shadow-md flex items-center justify-center mb-2`}
                        >
                          {createElement(
                            moods[selectedMoodDetails.moodValue].icon,
                            {
                              className: `w-8 h-8 ${
                                moods[selectedMoodDetails.moodValue].color
                              }`,
                              "aria-hidden": "true",
                            }
                          )}
                        </div>
                        <h3 className="text-lg font-medium text-white drop-shadow-sm">
                          {moods[selectedMoodDetails.moodValue].label}
                        </h3>
                      </div>
                    </div>

                    <CardHeader className="pb-2 pt-6">
                      <CardTitle className="text-[#5d5a55] text-xl">
                        {format(
                          new Date(year, month, selectedDay),
                          "yyyy年MM月dd日 (EEEE)",
                          {
                            locale: ja,
                          }
                        )}
                      </CardTitle>
                      <CardDescription>
                        {isSameDay(
                          new Date(year, month, selectedDay),
                          new Date()
                        )
                          ? "今日の気分"
                          : "過去の気分"}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-6">
                        {/* Mood visualization */}
                        <div className="flex items-center justify-between py-2 px-4 rounded-lg bg-gray-50">
                          <span className="text-sm font-medium text-gray-500">
                            気分レベル
                          </span>
                          <div
                            className="flex items-center gap-1"
                            aria-label={`気分レベル: ${
                              selectedMoodDetails.moodValue + 1
                            }/5`}
                          >
                            {[0, 1, 2, 3, 4].map((level) => (
                              <div
                                key={level}
                                className={`w-8 h-2 rounded-full ${
                                  level <= selectedMoodDetails.moodValue
                                    ? moods[
                                        selectedMoodDetails.moodValue
                                      ].color.replace("text", "bg")
                                    : "bg-gray-200"
                                }`}
                                aria-hidden="true"
                              />
                            ))}
                          </div>
                        </div>

                        {/* Note section with better styling */}
                        {selectedMoodDetails.note && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-500">
                              メモ
                            </h4>
                            <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                              <p className="text-sm whitespace-pre-wrap">
                                {selectedMoodDetails.note}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Tags with improved styling */}
                        {selectedMoodDetails.tags &&
                          selectedMoodDetails.tags.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-gray-500">
                                タグ
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedMoodDetails.tags.map(
                                  (tag: string, index: number) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className={`${
                                        moods[selectedMoodDetails.moodValue]
                                          .bgColor
                                      } ${moods[
                                        selectedMoodDetails.moodValue
                                      ].color.replace(
                                        "text",
                                        "border"
                                      )} border-2`}
                                    >
                                      <Tag
                                        className="w-3 h-3 mr-1"
                                        aria-hidden="true"
                                      />
                                      {tag}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ) : (
                <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm h-full flex items-center justify-center">
                  <div className="text-center p-8">
                    <CalendarIcon
                      className="w-12 h-12 text-gray-300 mx-auto mb-4"
                      aria-hidden="true"
                    />
                    <h3 className="text-lg font-medium text-gray-500 mb-2">
                      日付を選択してください
                    </h3>
                    <p className="text-sm text-gray-400">
                      カレンダーから日付を選択すると、その日の気分が表示されます。
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
