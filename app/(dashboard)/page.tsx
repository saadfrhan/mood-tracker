"use client";

import React from "react";

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
  Cloud,
  CloudSun,
  Cloudy,
  Droplets,
  Sun,
  Tag,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { format, isSameDay, subDays, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import { useSession } from "next-auth/react";
import { UserNav } from "@/components/user-nav";
import { Badge } from "@/components/ui/badge";

// Add cache-related constants
const CACHE_KEY = "mood-tracker-cache";
const CACHE_EXPIRY = 1000 * 60 * 30; // 30 minutes in milliseconds

interface MoodEntry {
  id: string;
  date: string;
  moodValue: number;
  note?: string;
  tags?: string[];
}

interface CacheData {
  moodEntries: Record<string, number>;
  timestamp: number;
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [moodEntries, setMoodEntries] = useState<Record<string, number>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [note, setNote] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const moodTags = [
    "睡眠",
    "食事",
    "運動",
    "仕事",
    "社交",
    "天気",
    "健康",
  ]; /* English: Sleep, Diet, Exercise, Work, Social, Weather, Health */
  const [selectedMoodDetails, setSelectedMoodDetails] = useState<{
    note?: string;
    tags?: string[];
  } | null>(null);

  // Add cache functions
  const getCachedData = (): CacheData | null => {
    if (typeof window === "undefined") return null;

    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (!cachedData) return null;

      const parsedData: CacheData = JSON.parse(cachedData);

      // Check if cache is expired
      if (Date.now() - parsedData.timestamp > CACHE_EXPIRY) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      return parsedData;
    } catch (error) {
      console.error("Error reading from cache:", error);
      return null;
    }
  };

  const setCachedData = (data: Record<string, number>) => {
    if (typeof window === "undefined") return;

    try {
      const cacheData: CacheData = {
        moodEntries: data,
        timestamp: Date.now(),
      };

      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error("Error writing to cache:", error);
    }
  };

  const moods = [
    {
      icon: Sun,
      label: "最高" /* English: Excellent */,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
      hoverBg: "hover:bg-amber-50",
      hoverText: "hover:text-amber-700",
      hoverBorder: "hover:border-amber-200",
    },
    {
      icon: CloudSun,
      label: "良い" /* English: Good */,
      color: "text-sky-400",
      bgColor: "bg-sky-50",
      hoverBg: "hover:bg-sky-50",
      hoverText: "hover:text-sky-700",
      hoverBorder: "hover:border-sky-200",
    },
    {
      icon: Cloud,
      label: "普通" /* English: Normal */,
      color: "text-gray-400",
      bgColor: "bg-gray-50",
      hoverBg: "hover:bg-gray-50",
      hoverText: "hover:text-gray-700",
      hoverBorder: "hover:border-gray-200",
    },
    {
      icon: Cloudy,
      label: "少し悪い" /* English: Slightly Bad */,
      color: "text-indigo-400",
      bgColor: "bg-indigo-50",
      hoverBg: "hover:bg-indigo-50",
      hoverText: "hover:text-indigo-700",
      hoverBorder: "hover:border-indigo-200",
    },
    {
      icon: Droplets,
      label: "悪い" /* English: Bad */,
      color: "text-purple-400",
      bgColor: "bg-purple-50",
      hoverBg: "hover:bg-purple-50",
      hoverText: "hover:text-purple-700",
      hoverBorder: "hover:border-purple-200",
    },
  ];

  // Fetch mood entries from the API
  useEffect(() => {
    const fetchMoodEntries = async () => {
      if (status !== "authenticated") return;

      try {
        setIsLoading(true);

        // Try to get data from cache first
        const cachedData = getCachedData();
        if (cachedData) {
          console.log("Using cached mood data");
          setMoodEntries(cachedData.moodEntries);
          setIsLoading(false);
          return;
        }

        // If no cache, fetch from API
        console.log("Fetching mood data from API");
        const response = await fetch("/api/mood");

        if (!response.ok) {
          throw new Error("Failed to fetch mood entries");
        }

        const data: MoodEntry[] = await response.json();

        // Convert the array of mood entries to a record
        const entriesRecord: Record<string, number> = {};
        data.forEach((entry) => {
          const dateKey = format(parseISO(entry.date), "yyyy-MM-dd");
          entriesRecord[dateKey] = entry.moodValue;
        });

        // Update state and cache
        setMoodEntries(entriesRecord);
        setCachedData(entriesRecord);
      } catch (error) {
        console.error("Error fetching mood entries:", error);
        toast({
          title: "エラーが発生しました" /* English: An error occurred */,
          description:
            "気分データの取得に失敗しました。" /* English: Failed to fetch mood data. */,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchMoodEntries();
    }
  }, [status]);

  const handleMoodSelection = (index: number) => {
    setSelectedMood(index);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (selectedMood === null) {
      toast({
        title: "気分を選択してください" /* English: Please select a mood */,
        description:
          "記録する前に気分を選んでください。" /* English: Please choose your mood before recording. */,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const dateToUse = selectedDate || new Date();
      const response = await fetch("/api/mood", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: dateToUse.toISOString(),
          moodValue: selectedMood,
          note: note,
          tags: selectedTags,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save mood entry");
      }

      // Update local state
      const dateKey = format(dateToUse, "yyyy-MM-dd");
      const updatedMoodEntries = {
        ...moodEntries,
        [dateKey]: selectedMood,
      };

      setMoodEntries(updatedMoodEntries);

      // Update cache with new data
      setCachedData(updatedMoodEntries);

      toast({
        title: "気分を記録しました" /* English: Mood recorded */,
        description: `今日の気分: ${moods[selectedMood].label}` /* English: Today's mood: [selected mood] */,
      });

      // Reset form
      setNote("");
      setSelectedTags([]);
      setIsDialogOpen(false);

      // Refresh mood details
      fetchMoodDetails(dateToUse);
    } catch (error) {
      console.error("Error saving mood entry:", error);
      toast({
        title: "エラーが発生しました" /* English: An error occurred */,
        description:
          "気分の記録に失敗しました。" /* English: Failed to record mood. */,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calendar functions
  const currentMonth = new Date();

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

  const handleDateClick = (day: number) => {
    const selectedDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    setSelectedDate(selectedDate);

    // If it's today, open the dialog to add mood
    if (isSameDay(selectedDate, new Date())) {
      setIsDialogOpen(true);
    }

    // Fetch mood details for the selected date
    fetchMoodDetails(selectedDate);
  };

  const fetchMoodDetails = async (date: Date) => {
    if (!session?.user) return;

    const dateKey = format(date, "yyyy-MM-dd");
    if (!(dateKey in moodEntries)) {
      setSelectedMoodDetails(null);
      return;
    }

    try {
      const response = await fetch(
        `/api/mood?date=${dateKey}&includeDetails=true`
      );
      if (!response.ok) throw new Error("Failed to fetch mood details");

      const data = await response.json();
      if (data) {
        setSelectedMoodDetails({
          note: data.note,
          tags: data.tags,
        });

        // If dialog is open, update form values
        if (isDialogOpen) {
          setSelectedMood(data.moodValue);
          setNote(data.note || "");
          setSelectedTags(data.tags || []);
        }
      }
    } catch (error) {
      console.error("Error fetching mood details:", error);
      toast({
        title: "エラーが発生しました",
        description: "気分の詳細を取得できませんでした。",
        variant: "destructive",
      });
    }
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
          className="text-center text-xs font-medium text-muted-foreground py-1"
        >
          {daysOfWeek[i]}
        </div>
      );
    }

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-0.5"></div>);
    }

    // Render days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      const dateKey = format(date, "yyyy-MM-dd");
      const isToday = isSameDay(date, new Date());
      const isSelected = selectedDate && isSameDay(date, selectedDate);
      const hasMood = dateKey in moodEntries;

      let moodIcon = null;
      if (hasMood) {
        const MoodIcon = moods[moodEntries[dateKey]].icon;
        moodIcon = (
          <MoodIcon
            className={`w-3 h-3 ${moods[moodEntries[dateKey]].color}`}
          />
        );
      }

      days.push(
        <div key={`day-${day}`} className="p-0.5">
          <div
            className={`aspect-square rounded-full flex flex-col items-center justify-center cursor-pointer transition-colors
              ${
                isToday ? "border-2 border-pink-400" : "border border-[#e7e0d8]"
              }
              ${isSelected ? "bg-pink-50" : ""}
              ${
                hasMood
                  ? moods[moodEntries[dateKey]].bgColor
                  : "hover:bg-pink-50"
              }
            `}
            onClick={() => handleDateClick(day)}
          >
            <div className="text-xs mb-0.5">{day}</div>
            {moodIcon}
          </div>
        </div>
      );
    }

    return days;
  };

  // Calculate mood distribution for the week
  const calculateWeeklyMoods = () => {
    const weeklyMoods = [0, 0, 0, 0, 0, 0, 0]; // One for each day of the week
    const weeklyMoodIndices: (number | null)[] = [
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ]; // Store the mood indices

    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateKey = format(date, "yyyy-MM-dd");
      const dayIndex = 6 - i; // 0 = Monday, 6 = Sunday in our display

      if (dateKey in moodEntries) {
        weeklyMoods[dayIndex] = 1; // Has entry
        weeklyMoodIndices[dayIndex] = moodEntries[dateKey];
      }
    }

    return { weeklyMoods, weeklyMoodIndices };
  };

  const { weeklyMoods, weeklyMoodIndices } = calculateWeeklyMoods();

  // Fetch mood details when selected date changes
  useEffect(() => {
    if (selectedDate && session?.user) {
      fetchMoodDetails(selectedDate);
    }
  }, [selectedDate, moodEntries, session?.user]);

  // Add a function to manually refresh data
  const refreshMoodData = async () => {
    if (status !== "authenticated") return;

    try {
      setIsLoading(true);

      // Clear cache to force a fresh fetch
      localStorage.removeItem(CACHE_KEY);

      const response = await fetch("/api/mood");

      if (!response.ok) {
        throw new Error("Failed to fetch mood entries");
      }

      const data: MoodEntry[] = await response.json();

      // Convert the array of mood entries to a record
      const entriesRecord: Record<string, number> = {};
      data.forEach((entry) => {
        const dateKey = format(parseISO(entry.date), "yyyy-MM-dd");
        entriesRecord[dateKey] = entry.moodValue;
      });

      // Update state and cache
      setMoodEntries(entriesRecord);
      setCachedData(entriesRecord);

      toast({
        title: "データを更新しました" /* English: Data updated */,
        description:
          "最新の気分データを取得しました。" /* English: Retrieved the latest mood data. */,
      });
    } catch (error) {
      console.error("Error refreshing mood entries:", error);
      toast({
        title: "エラーが発生しました" /* English: An error occurred */,
        description:
          "気分データの更新に失敗しました。" /* English: Failed to update mood data. */,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f6f2]">
      <div className="flex-1 flex flex-col">
        <header className="border-b border-[#e7e0d8] bg-white/50 backdrop-blur-sm sticky top-0 z-10 h-14">
          <div className="container flex items-center justify-between h-full px-4 md:px-6">
            <div className="flex items-center gap-2 md:hidden">
              <Cherry className="w-5 h-5 text-pink-400" />
              <span className="text-lg font-medium text-[#5d5a55]">
                こころ日記
              </span>
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-medium text-[#5d5a55]">ホーム</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={refreshMoodData}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-pink-200 border-t-pink-500 mr-1"></div>
                ) : (
                  <Sun className="h-3 w-3 mr-1" />
                )}
                更新
              </Button>
              <UserNav />
            </div>
          </div>
        </header>

        <main className="flex-1 container py-4 px-4 md:px-6 max-w-8xl mx-auto">
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-fit">
            {/* Today's Mood Section - Left Column */}
            <div className="lg:col-span-1">
              <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm overflow-hidden h-full">
                <CardHeader className="pb-1 pt-3">
                  <CardTitle className="text-[#5d5a55] text-base">
                    今日の気分
                    {/* English: Today's Mood */}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    今の気持ちを記録しましょう
                    {/* English: Record your current mood */}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-1">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-4">
                      <div className="h-6 w-6 animate-spin rounded-full border-3 border-pink-200 border-t-pink-500"></div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-5 gap-1">
                        {moods.map((mood, index) => {
                          const Icon = mood.icon;
                          return (
                            <Button
                              key={index}
                              variant="outline"
                              className={`flex flex-col h-auto py-2 gap-1 border border-[#e7e0d8] ${
                                mood.hoverBg
                              } ${mood.hoverText} ${
                                mood.hoverBorder
                              } transition-all ${
                                selectedMood === index
                                  ? "bg-pink-50 border-pink-200 ring-1 ring-pink-200"
                                  : ""
                              }`}
                              onClick={() => {
                                handleMoodSelection(index);
                                setIsExpanded(true);
                              }}
                            >
                              <div
                                className={`w-8 h-8 rounded-full ${mood.bgColor} flex items-center justify-center`}
                              >
                                <Icon className={`w-4 h-4 ${mood.color}`} />
                              </div>
                              <span className="text-xs font-medium">
                                {mood.label}
                              </span>
                            </Button>
                          );
                        })}
                      </div>

                      {isExpanded && (
                        <div className="space-y-2 pt-2 border-t border-[#e7e0d8]">
                          <div className="space-y-1">
                            <label
                              htmlFor="mood-note"
                              className="text-xs font-medium"
                            >
                              メモ
                            </label>
                            <textarea
                              id="mood-note"
                              className="w-full min-h-[60px] rounded-md border border-[#e7e0d8] bg-transparent px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-400"
                              placeholder="今日の気分についてメモを残しましょう..."
                              value={note}
                              onChange={(e) => setNote(e.target.value)}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-medium">タグ</label>
                            <div className="flex flex-wrap gap-1">
                              {moodTags.map((tag, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => toggleTag(tag)}
                                  className={`px-1.5 py-0.5 text-xs rounded-full border transition-colors ${
                                    selectedTags.includes(tag)
                                      ? "bg-pink-100 border-pink-200 text-pink-700"
                                      : "border-[#e7e0d8] hover:bg-pink-50"
                                  }`}
                                >
                                  {tag}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-7 px-2"
                              onClick={() => {
                                setIsExpanded(false);
                                setSelectedMood(null);
                                setNote("");
                                setSelectedTags([]);
                              }}
                            >
                              キャンセル
                            </Button>
                            <Button
                              size="sm"
                              className="bg-pink-400 hover:bg-pink-500 text-white text-xs h-7 px-2"
                              onClick={handleSubmit}
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? (
                                <div className="flex items-center gap-1">
                                  <div className="h-2 w-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                  <span>記録中...</span>
                                </div>
                              ) : (
                                "記録する"
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Calendar and Weekly View - Middle and Right Columns */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-full">
                {/* Calendar Section */}
                <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-1 pt-3">
                    <CardTitle className="text-[#5d5a55] text-base">
                      カレンダー
                    </CardTitle>
                    <CardDescription className="text-xs">
                      日付をクリックして気分を記録しましょう
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-1">
                    <div className="grid grid-cols-7 gap-0.5 mb-2">
                      {renderCalendarDays()}
                    </div>

                    {selectedDate && (
                      <div className="pt-2 border-t border-[#e7e0d8]">
                        <h3 className="text-xs font-medium mb-1">
                          {format(selectedDate, "yyyy年MM月dd日 (EEEE)", {
                            locale: ja,
                          })}
                        </h3>

                        {selectedDate &&
                        format(selectedDate, "yyyy-MM-dd") in moodEntries ? (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-8 h-8 rounded-full ${
                                  moods[
                                    moodEntries[
                                      format(selectedDate, "yyyy-MM-dd")
                                    ]
                                  ].bgColor
                                } flex items-center justify-center`}
                              >
                                {React.createElement(
                                  moods[
                                    moodEntries[
                                      format(selectedDate, "yyyy-MM-dd")
                                    ]
                                  ].icon,
                                  {
                                    className: `w-4 h-4 ${
                                      moods[
                                        moodEntries[
                                          format(selectedDate, "yyyy-MM-dd")
                                        ]
                                      ].color
                                    }`,
                                  }
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-xs">
                                  {
                                    moods[
                                      moodEntries[
                                        format(selectedDate, "yyyy-MM-dd")
                                      ]
                                    ].label
                                  }
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {isSameDay(selectedDate, new Date())
                                    ? "今日"
                                    : format(selectedDate, "MM月dd日")}
                                  の気分
                                </p>
                              </div>
                            </div>

                            {selectedMoodDetails && (
                              <>
                                {selectedMoodDetails.note && (
                                  <div className="pt-1 text-xs">
                                    <p className="whitespace-pre-wrap">
                                      {selectedMoodDetails.note}
                                    </p>
                                  </div>
                                )}

                                {selectedMoodDetails.tags &&
                                  selectedMoodDetails.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 pt-1">
                                      {selectedMoodDetails.tags.map(
                                        (tag, index) => (
                                          <Badge
                                            key={index}
                                            variant="outline"
                                            className="bg-pink-50 text-pink-700 border-pink-200 text-xs px-1 py-0"
                                          >
                                            <Tag className="w-3 h-3 mr-0.5" />
                                            {tag}
                                          </Badge>
                                        )
                                      )}
                                    </div>
                                  )}
                              </>
                            )}

                            {isSameDay(selectedDate, new Date()) && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-1 self-end text-xs h-6 px-1.5"
                                onClick={() => {
                                  setIsExpanded(true);
                                  if (selectedMoodDetails) {
                                    setNote(selectedMoodDetails.note || "");
                                    setSelectedTags(
                                      selectedMoodDetails.tags || []
                                    );
                                  }
                                }}
                              >
                                編集する
                              </Button>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-1">
                            {isSameDay(selectedDate, new Date()) ? (
                              <Button
                                size="sm"
                                className="bg-pink-400 hover:bg-pink-500 text-white text-xs h-6 px-1.5"
                                onClick={() => setIsExpanded(true)}
                              >
                                今日の気分を記録する
                              </Button>
                            ) : (
                              <p className="text-muted-foreground text-xs">
                                この日の記録はありません
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* This Week's Mood Section */}
                <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-1 pt-3">
                    <CardTitle className="text-[#5d5a55] text-base">
                      今週の気分
                    </CardTitle>
                    <CardDescription className="text-xs">
                      一週間の気分の変化
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-1">
                    <div className="space-y-2">
                      <div className="grid grid-cols-7 gap-1">
                        {["月", "火", "水", "木", "金", "土", "日"].map(
                          (day, i) => (
                            <div
                              key={i}
                              className="flex flex-col items-center gap-0.5"
                            >
                              <div className="text-xs text-muted-foreground">
                                {day}
                              </div>
                              <div className="w-full aspect-square rounded-md flex items-center justify-center">
                                {weeklyMoods[i] === 1 &&
                                weeklyMoodIndices[i] !== null ? (
                                  <div
                                    className={`w-6 h-6 rounded-full ${
                                      moods[weeklyMoodIndices[i] as number]
                                        .bgColor
                                    } flex items-center justify-center`}
                                  >
                                    {React.createElement(
                                      moods[weeklyMoodIndices[i] as number]
                                        .icon,
                                      {
                                        className: `w-3 h-3 ${
                                          moods[weeklyMoodIndices[i] as number]
                                            .color
                                        }`,
                                      }
                                    )}
                                  </div>
                                ) : (
                                  <div className="w-5 h-5 rounded-full border border-dashed border-[#e7e0d8]" />
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground text-center">
                        今週は{moods[weeklyMoodIndices[6] || 2].label}
                        の気分が多かったです
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
