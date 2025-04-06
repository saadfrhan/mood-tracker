"use client";

import React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Cloud,
  CloudSun,
  Cloudy,
  Droplets,
  Sun,
  Cherry,
  Calendar,
  Clock,
  TrendingUp,
  BarChart3,
  Activity,
  Heart,
  Smile,
  Calendar as CalendarIcon,
  ArrowUp,
  ArrowDown,
  Info,
  RefreshCcw,
} from "lucide-react";
import { UserNav } from "@/components/user-nav";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "@/components/ui/use-toast";
import {
  format,
  parseISO,
  subDays,
  startOfMonth,
  endOfMonth,
  differenceInDays,
  isToday,
  isYesterday,
} from "date-fns";
import { ja } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

// Add cache-related constants
const STATS_CACHE_KEY = "mood-tracker-stats-cache";
const CACHE_EXPIRY = 1000 * 60 * 30; // 30 minutes in milliseconds

interface MoodEntry {
  id: string;
  date: string;
  moodValue: number;
  note?: string;
  tags?: string[];
}

interface MoodDistribution {
  moodValue: number;
  count: number;
  percentage: number;
}

interface WeeklyTrend {
  day: string;
  value: number;
  moodValue?: number;
  date: Date;
}

interface MoodFactor {
  factor: string;
  impact: number;
}

interface MonthlyComparison {
  currentMonth: number;
  previousMonth: number;
  change: number;
}

interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastEntryDate: Date | null;
}

interface CacheData {
  moodEntries: MoodEntry[];
  timestamp: number;
}

export default function StatsPage() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [moodDistribution, setMoodDistribution] = useState<MoodDistribution[]>(
    []
  );
  const [weeklyTrends, setWeeklyTrends] = useState<WeeklyTrend[]>([]);
  const [moodFactors, setMoodFactors] = useState<MoodFactor[]>([]);
  const [monthlyComparison, setMonthlyComparison] = useState<MonthlyComparison>(
    {
      currentMonth: 0,
      previousMonth: 0,
      change: 0,
    }
  );
  const [streakInfo, setStreakInfo] = useState<StreakInfo>({
    currentStreak: 0,
    longestStreak: 0,
    lastEntryDate: null,
  });
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">(
    "month"
  );
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [averageMood, setAverageMood] = useState<number>(0);
  const [moodTrend, setMoodTrend] = useState<
    "improving" | "declining" | "stable"
  >("stable");

  const moods = [
    {
      label: "最高",
      icon: Sun,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
      description: "とても良い気分",
    },
    {
      label: "良い",
      icon: CloudSun,
      color: "text-sky-400",
      bgColor: "bg-sky-50",
      description: "良い気分",
    },
    {
      label: "普通",
      icon: Cloud,
      color: "text-gray-400",
      bgColor: "bg-gray-50",
      description: "普通の気分",
    },
    {
      label: "少し悪い",
      icon: Cloudy,
      color: "text-indigo-400",
      bgColor: "bg-indigo-50",
      description: "少し悪い気分",
    },
    {
      label: "悪い",
      icon: Droplets,
      color: "text-purple-400",
      bgColor: "bg-purple-50",
      description: "悪い気分",
    },
  ];

  // Add cache functions
  const getCachedData = (): CacheData | null => {
    if (typeof window === "undefined") return null;

    try {
      const cachedData = localStorage.getItem(STATS_CACHE_KEY);
      if (!cachedData) return null;

      const parsedData: CacheData = JSON.parse(cachedData);

      // Check if cache is expired
      if (Date.now() - parsedData.timestamp > CACHE_EXPIRY) {
        localStorage.removeItem(STATS_CACHE_KEY);
        return null;
      }

      return parsedData;
    } catch (error) {
      console.error("Error reading from cache:", error);
      return null;
    }
  };

  const setCachedData = (data: MoodEntry[]) => {
    if (typeof window === "undefined") return;

    try {
      const cacheData: CacheData = {
        moodEntries: data,
        timestamp: Date.now(),
      };

      localStorage.setItem(STATS_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error("Error writing to cache:", error);
    }
  };

  // Fetch mood data
  useEffect(() => {
    const fetchMoodData = async () => {
      if (status !== "authenticated") return;

      try {
        setIsLoading(true);

        // Try to get data from cache first
        const cachedData = getCachedData();
        if (cachedData) {
          console.log("Using cached mood data for stats");
          setMoodEntries(cachedData.moodEntries);
          setIsLoading(false);
          return;
        }

        // If no cache, fetch from API
        console.log("Fetching mood data from API for stats");
        const response = await fetch("/api/mood");

        if (!response.ok) {
          throw new Error("Failed to fetch mood entries");
        }

        const data = await response.json();
        setMoodEntries(data);

        // Update cache with new data
        setCachedData(data);
      } catch (error) {
        console.error("Error fetching mood entries:", error);
        toast({
          title: "エラーが発生しました",
          description: "気分データの取得に失敗しました。",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMoodData();
  }, [status]);

  useEffect(() => {
    const fetchMoodData = async () => {
      if (status !== "authenticated") return;

      try {
        setIsLoading(true);

        // Get the current month's date range
        const today = new Date();
        const firstDayOfMonth = startOfMonth(today);
        const lastDayOfMonth = endOfMonth(today);

        // Get the previous month's date range
        const firstDayOfPreviousMonth = startOfMonth(
          subDays(firstDayOfMonth, 1)
        );
        const lastDayOfPreviousMonth = endOfMonth(firstDayOfPreviousMonth);

        // Fetch mood entries for the current month
        const currentMonthResponse = await fetch(
          `/api/mood?startDate=${firstDayOfMonth.toISOString()}&endDate=${lastDayOfMonth.toISOString()}`
        );

        if (!currentMonthResponse.ok) {
          throw new Error("Failed to fetch current month mood data");
        }

        const currentMonthEntries: MoodEntry[] =
          await currentMonthResponse.json();

        // Fetch mood entries for the previous month
        const previousMonthResponse = await fetch(
          `/api/mood?startDate=${firstDayOfPreviousMonth.toISOString()}&endDate=${lastDayOfPreviousMonth.toISOString()}`
        );

        if (!previousMonthResponse.ok) {
          throw new Error("Failed to fetch previous month mood data");
        }

        const previousMonthEntries: MoodEntry[] =
          await previousMonthResponse.json();

        // Fetch all mood entries for the year
        const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
        const yearResponse = await fetch(
          `/api/mood?startDate=${firstDayOfYear.toISOString()}&endDate=${today.toISOString()}`
        );

        if (!yearResponse.ok) {
          throw new Error("Failed to fetch year mood data");
        }

        const yearEntries: MoodEntry[] = await yearResponse.json();
        setMoodEntries(yearEntries);

        // Calculate mood distribution
        const distribution = calculateMoodDistribution(currentMonthEntries);
        setMoodDistribution(distribution);

        // Calculate weekly trends
        const trends = calculateWeeklyTrends(currentMonthEntries);
        setWeeklyTrends(trends);

        // Calculate mood factors
        const factors = calculateMoodFactors(currentMonthEntries);
        setMoodFactors(factors);

        // Calculate monthly comparison
        const comparison = calculateMonthlyComparison(
          currentMonthEntries,
          previousMonthEntries
        );
        setMonthlyComparison(comparison);

        // Calculate streak information
        const streak = calculateStreakInfo(yearEntries);
        setStreakInfo(streak);

        // Calculate average mood
        const avgMood = calculateAverageMood(currentMonthEntries);
        setAverageMood(avgMood);

        // Determine mood trend
        const trend = determineMoodTrend(
          currentMonthEntries,
          previousMonthEntries
        );
        setMoodTrend(trend);
      } catch (error) {
        console.error("Error fetching mood data:", error);
        toast({
          title: "エラーが発生しました",
          description: "統計データの取得に失敗しました。",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMoodData();
  }, [status, timeRange]);

  // Calculate mood distribution from mood entries
  const calculateMoodDistribution = (
    entries: MoodEntry[]
  ): MoodDistribution[] => {
    const distribution = Array(5)
      .fill(0)
      .map((_, i) => ({
        moodValue: i,
        count: 0,
        percentage: 0,
      }));

    // Count occurrences of each mood value
    entries.forEach((entry) => {
      if (entry.moodValue >= 0 && entry.moodValue < 5) {
        distribution[entry.moodValue].count++;
      }
    });

    // Calculate percentages
    const total = entries.length;
    distribution.forEach((item) => {
      item.percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
    });

    return distribution;
  };

  // Calculate weekly trends from mood entries
  const calculateWeeklyTrends = (entries: MoodEntry[]): WeeklyTrend[] => {
    const days = ["月", "火", "水", "木", "金", "土", "日"];
    const trends: WeeklyTrend[] = days.map((day, index) => {
      const date = subDays(new Date(), 6 - index);
      return { day, value: 0, date };
    });

    // Get entries from the last 7 days
    const last7Days = Array(7)
      .fill(0)
      .map((_, i) => {
        const date = subDays(new Date(), 6 - i);
        return format(date, "yyyy-MM-dd");
      });

    // Map entries to days
    last7Days.forEach((dateStr, index) => {
      const dayEntries = entries.filter((entry) => {
        const entryDate = format(parseISO(entry.date), "yyyy-MM-dd");
        return entryDate === dateStr;
      });

      if (dayEntries.length > 0) {
        // Use the first entry for the day (most recent)
        const entry = dayEntries[0];

        // Map mood values to a 0-100 scale for visualization
        // 0 (bad) = 20, 4 (excellent) = 100
        const moodScore = 20 + (4 - entry.moodValue) * 20;

        trends[index].value = moodScore;
        trends[index].moodValue = entry.moodValue;
      } else {
        // No entry for this day
        trends[index].value = 0;
      }
    });

    return trends;
  };

  // Calculate mood factors from mood entries
  const calculateMoodFactors = (entries: MoodEntry[]): MoodFactor[] => {
    // Count tag occurrences
    const tagCounts: Record<string, number> = {};
    let totalTags = 0;

    entries.forEach((entry) => {
      if (entry.tags && entry.tags.length > 0) {
        entry.tags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          totalTags++;
        });
      }
    });

    // Convert to array and calculate impact percentages
    const factors = Object.entries(tagCounts).map(([factor, count]) => ({
      factor,
      impact: Math.round((count / Math.max(totalTags, 1)) * 100),
    }));

    // Sort by impact (descending)
    return factors.sort((a, b) => b.impact - a.impact).slice(0, 5);
  };

  // Calculate monthly comparison
  const calculateMonthlyComparison = (
    currentMonthEntries: MoodEntry[],
    previousMonthEntries: MoodEntry[]
  ): MonthlyComparison => {
    // Calculate average mood for current month
    const currentMonthAvg = calculateAverageMood(currentMonthEntries);

    // Calculate average mood for previous month
    const previousMonthAvg = calculateAverageMood(previousMonthEntries);

    // Calculate change
    const change =
      previousMonthAvg > 0
        ? Math.round(
            ((currentMonthAvg - previousMonthAvg) / previousMonthAvg) * 100
          )
        : 0;

    return {
      currentMonth: currentMonthAvg,
      previousMonth: previousMonthAvg,
      change,
    };
  };

  // Calculate streak information
  const calculateStreakInfo = (entries: MoodEntry[]): StreakInfo => {
    if (entries.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastEntryDate: null,
      };
    }

    // Sort entries by date (newest first)
    const sortedEntries = [...entries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const lastEntryDate = new Date(sortedEntries[0].date);

    // Calculate current streak
    let currentStreak = 1;
    let currentDate = lastEntryDate;

    for (let i = 1; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date);
      const daysDiff = differenceInDays(currentDate, entryDate);

      if (daysDiff === 1) {
        currentStreak++;
        currentDate = entryDate;
      } else {
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 1;
    let streakCount = 1;
    let streakStartDate = new Date(sortedEntries[0].date);

    for (let i = 1; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date);
      const daysDiff = differenceInDays(streakStartDate, entryDate);

      if (daysDiff === 1) {
        streakCount++;
        streakStartDate = entryDate;
        longestStreak = Math.max(longestStreak, streakCount);
      } else {
        streakCount = 1;
        streakStartDate = entryDate;
      }
    }

    return {
      currentStreak,
      longestStreak,
      lastEntryDate,
    };
  };

  // Calculate average mood
  const calculateAverageMood = (entries: MoodEntry[]): number => {
    if (entries.length === 0) return 0;

    const sum = entries.reduce((total, entry) => total + entry.moodValue, 0);
    return Math.round((sum / entries.length) * 100) / 100;
  };

  // Determine mood trend
  const determineMoodTrend = (
    currentMonthEntries: MoodEntry[],
    previousMonthEntries: MoodEntry[]
  ): "improving" | "declining" | "stable" => {
    const currentAvg = calculateAverageMood(currentMonthEntries);
    const previousAvg = calculateAverageMood(previousMonthEntries);

    if (currentAvg > previousAvg + 0.5) {
      return "improving";
    } else if (currentAvg < previousAvg - 0.5) {
      return "declining";
    } else {
      return "stable";
    }
  };

  // Get mood trend icon
  const getMoodTrendIcon = () => {
    switch (moodTrend) {
      case "improving":
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case "declining":
        return (
          <TrendingUp className="h-5 w-5 text-red-500 transform rotate-180" />
        );
      case "stable":
        return <Activity className="h-5 w-5 text-blue-500" />;
    }
  };

  // Get mood trend text
  const getMoodTrendText = () => {
    switch (moodTrend) {
      case "improving":
        return "気分が改善傾向にあります";
      case "declining":
        return "気分が低下傾向にあります";
      case "stable":
        return "気分は安定しています";
    }
  };

  // Get mood trend color
  const getMoodTrendColor = () => {
    switch (moodTrend) {
      case "improving":
        return "text-green-500";
      case "declining":
        return "text-red-500";
      case "stable":
        return "text-blue-500";
    }
  };

  // Format date for display
  const formatDateDisplay = (date: Date) => {
    if (isToday(date)) {
      return "今日";
    } else if (isYesterday(date)) {
      return "昨日";
    } else {
      return format(date, "M月d日", { locale: ja });
    }
  };

  // Get mood label from value
  const getMoodLabel = (value: number) => {
    return moods[value]?.label || "不明";
  };

  // Add a function to manually refresh data
  const refreshMoodData = async () => {
    if (status !== "authenticated") return;

    try {
      setIsLoading(true);

      // Clear cache to force a fresh fetch
      localStorage.removeItem(STATS_CACHE_KEY);

      const response = await fetch("/api/mood");

      if (!response.ok) {
        throw new Error("Failed to fetch mood entries");
      }

      const data = await response.json();
      setMoodEntries(data);

      // Update cache with new data
      setCachedData(data);

      toast({
        title: "データを更新しました",
        description: "最新の気分データを取得しました。",
      });
    } catch (error) {
      console.error("Error refreshing mood entries:", error);
      toast({
        title: "エラーが発生しました",
        description: "気分データの更新に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-[#e7e0d8] bg-white/50 backdrop-blur-sm sticky top-0 z-10 h-14">
        <div className="container flex items-center justify-between h-full px-4 md:px-6">
          <div className="flex items-center gap-2 md:hidden">
            <Cherry className="w-5 h-5 text-pink-400" />
            <span className="text-lg font-medium text-[#5d5a55]">
              こころ日記
            </span>
          </div>
          <div className="hidden md:block">
            <h1 className="text-xl font-medium text-[#5d5a55]">統計</h1>
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
                <RefreshCcw className="h-3 w-3 mr-1" />
              )}
              更新
            </Button>
            <Select
              value={timeRange}
              onValueChange={(value: "week" | "month" | "year") =>
                setTimeRange(value)
              }
            >
              <SelectTrigger className="w-[120px] h-8 text-xs">
                <SelectValue placeholder="期間を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">週間</SelectItem>
                <SelectItem value="month">月間</SelectItem>
                <SelectItem value="year">年間</SelectItem>
              </SelectContent>
            </Select>
            <UserNav />
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8 px-4 md:px-6 max-w-5xl">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500"></div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-[#5d5a55] flex items-center gap-2">
                    <Heart className="h-4 w-4 text-pink-400" />
                    平均気分
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-[#5d5a55]">
                      {averageMood.toFixed(1)}
                    </span>
                    <span className="text-sm text-muted-foreground mb-1">
                      / 4.0
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {getMoodTrendIcon()}
                    <span className={`text-xs ${getMoodTrendColor()}`}>
                      {getMoodTrendText()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-[#5d5a55] flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-pink-400" />
                    連続記録
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-[#5d5a55]">
                      {streakInfo.currentStreak}
                    </span>
                    <span className="text-sm text-muted-foreground mb-1">
                      日
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-muted-foreground">
                      最長: {streakInfo.longestStreak}日
                    </span>
                    {streakInfo.lastEntryDate && (
                      <span className="text-xs text-muted-foreground">
                        (最終: {formatDateDisplay(streakInfo.lastEntryDate)})
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-[#5d5a55] flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-pink-400" />
                    月間比較
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-[#5d5a55]">
                      {monthlyComparison.currentMonth.toFixed(1)}
                    </span>
                    <span className="text-sm text-muted-foreground mb-1">
                      / 4.0
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {monthlyComparison.change > 0 ? (
                      <ArrowUp className="h-3 w-3 text-green-500" />
                    ) : monthlyComparison.change < 0 ? (
                      <ArrowDown className="h-3 w-3 text-red-500" />
                    ) : (
                      <Activity className="h-3 w-3 text-blue-500" />
                    )}
                    <span
                      className={`text-xs ${
                        monthlyComparison.change > 0
                          ? "text-green-500"
                          : monthlyComparison.change < 0
                          ? "text-red-500"
                          : "text-blue-500"
                      }`}
                    >
                      {monthlyComparison.change > 0 ? "+" : ""}
                      {monthlyComparison.change}% 前月比
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="overview">概要</TabsTrigger>
                <TabsTrigger value="trends">傾向</TabsTrigger>
                <TabsTrigger value="insights">分析</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm mb-6">
                  <CardHeader>
                    <CardTitle className="text-[#5d5a55]">気分の分布</CardTitle>
                    <CardDescription>過去30日間の気分の分布</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {moodDistribution.length > 0 ? (
                      <div className="space-y-4">
                        {moodDistribution.map((item) => {
                          const mood = moods[item.moodValue];
                          const Icon = mood.icon;
                          return (
                            <div
                              key={item.moodValue}
                              className="flex items-center gap-3"
                            >
                              <div
                                className={`w-10 h-10 rounded-full ${mood.bgColor} flex items-center justify-center`}
                              >
                                <Icon className={`w-5 h-5 ${mood.color}`} />
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm font-medium">
                                    {mood.label}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {item.count}日 ({item.percentage}%)
                                  </span>
                                </div>
                                <Progress
                                  value={item.percentage}
                                  className="h-2 bg-[#f0ebe5]"
                                  indicatorClassName="bg-pink-400"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          まだ気分の記録がありません。気分を記録して統計を確認しましょう。
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm mb-6">
                  <CardHeader>
                    <CardTitle className="text-[#5d5a55]">気分の要因</CardTitle>
                    <CardDescription>
                      あなたの気分に影響を与える要因
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {moodFactors.length > 0 ? (
                      <div className="space-y-4">
                        {moodFactors.map((item, index) => (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">
                                {item.factor}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {item.impact}%
                              </span>
                            </div>
                            <Progress
                              value={item.impact}
                              className="h-2 bg-[#f0ebe5]"
                              indicatorClassName="bg-pink-400"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          まだタグ付けされた気分の記録がありません。タグを使って気分を記録しましょう。
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="trends">
                <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm mb-6">
                  <CardHeader>
                    <CardTitle className="text-[#5d5a55]">週間傾向</CardTitle>
                    <CardDescription>過去7日間の気分の変化</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px] flex items-end justify-between gap-2">
                      {weeklyTrends.map((item, index) => (
                        <div
                          key={index}
                          className="flex flex-col items-center gap-2 flex-1"
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={`w-full ${
                                    item.value > 0
                                      ? "bg-pink-100"
                                      : "bg-gray-100"
                                  } rounded-t-md relative`}
                                  style={{
                                    maxHeight: `${item.value || 0}%`,
                                    height: "190px",
                                  }}
                                >
                                  {item.moodValue !== undefined && (
                                    <div className="absolute top-2 left-0 right-0 flex justify-center">
                                      {React.createElement(
                                        moods[item.moodValue].icon,
                                        {
                                          className: `w-4 h-4 ${
                                            moods[item.moodValue].color
                                          }`,
                                        }
                                      )}
                                    </div>
                                  )}
                                  {item.value > 0 && (
                                    <div className="absolute bottom-2 left-0 right-0 text-center text-xs font-medium text-pink-700">
                                      {item.value}%
                                    </div>
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{formatDateDisplay(item.date)}</p>
                                {item.moodValue !== undefined ? (
                                  <p>{getMoodLabel(item.moodValue)}</p>
                                ) : (
                                  <p>記録なし</p>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <div className="text-xs text-muted-foreground">
                            {item.day}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm mb-6">
                  <CardHeader>
                    <CardTitle className="text-[#5d5a55]">月間比較</CardTitle>
                    <CardDescription>今月と先月の気分の比較</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">今月</span>
                          <span className="text-sm font-bold">
                            {monthlyComparison.currentMonth.toFixed(1)}
                          </span>
                        </div>
                        <Progress
                          value={(monthlyComparison.currentMonth / 4) * 100}
                          className="h-2 bg-[#f0ebe5]"
                          indicatorClassName="bg-pink-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">先月</span>
                          <span className="text-sm font-bold">
                            {monthlyComparison.previousMonth.toFixed(1)}
                          </span>
                        </div>
                        <Progress
                          value={(monthlyComparison.previousMonth / 4) * 100}
                          className="h-2 bg-[#f0ebe5]"
                          indicatorClassName="bg-gray-400"
                        />
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-[#f8f6f2] rounded-md">
                      <div className="flex items-center gap-2">
                        {monthlyComparison.change > 0 ? (
                          <ArrowUp className="h-4 w-4 text-green-500" />
                        ) : monthlyComparison.change < 0 ? (
                          <ArrowDown className="h-4 w-4 text-red-500" />
                        ) : (
                          <Activity className="h-4 w-4 text-blue-500" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            monthlyComparison.change > 0
                              ? "text-green-500"
                              : monthlyComparison.change < 0
                              ? "text-red-500"
                              : "text-blue-500"
                          }`}
                        >
                          {monthlyComparison.change > 0 ? "+" : ""}
                          {monthlyComparison.change}% 前月比
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {monthlyComparison.change > 0
                          ? "今月は先月より気分が良くなっています"
                          : monthlyComparison.change < 0
                          ? "今月は先月より気分が悪くなっています"
                          : "今月の気分は先月と変わりません"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="insights">
                <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm mb-6">
                  <CardHeader>
                    <CardTitle className="text-[#5d5a55]">気分の分析</CardTitle>
                    <CardDescription>
                      あなたの気分パターンの分析
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="p-4 bg-[#f8f6f2] rounded-md">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            <Info className="h-5 w-5 text-pink-400" />
                          </div>
                          <div>
                            <h3 className="font-medium text-[#5d5a55] mb-1">
                              気分の傾向
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {moodTrend === "improving"
                                ? "あなたの気分は改善傾向にあります。最近の記録では、より良い気分を記録する頻度が増えています。"
                                : moodTrend === "declining"
                                ? "あなたの気分は低下傾向にあります。最近の記録では、より悪い気分を記録する頻度が増えています。"
                                : "あなたの気分は安定しています。最近の記録では、気分の変動が少なくなっています。"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-[#f8f6f2] rounded-md">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            <Calendar className="h-5 w-5 text-pink-400" />
                          </div>
                          <div>
                            <h3 className="font-medium text-[#5d5a55] mb-1">
                              記録の習慣
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {streakInfo.currentStreak > 0
                                ? `現在${streakInfo.currentStreak}日連続で記録しています。最長記録は${streakInfo.longestStreak}日です。`
                                : "まだ連続記録はありません。毎日記録することで、より正確な気分の傾向を把握できます。"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {moodFactors.length > 0 && (
                        <div className="p-4 bg-[#f8f6f2] rounded-md">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                              <Smile className="h-5 w-5 text-pink-400" />
                            </div>
                            <div>
                              <h3 className="font-medium text-[#5d5a55] mb-1">
                                気分に影響する要因
                              </h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                あなたの気分に最も影響を与える要因は以下の通りです：
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {moodFactors
                                  .slice(0, 3)
                                  .map((factor, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="bg-white"
                                    >
                                      {factor.factor}
                                    </Badge>
                                  ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="p-4 bg-[#f8f6f2] rounded-md">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            <Clock className="h-5 w-5 text-pink-400" />
                          </div>
                          <div>
                            <h3 className="font-medium text-[#5d5a55] mb-1">
                              記録のタイミング
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              気分の記録は、毎日同じ時間に行うと、より正確な傾向を把握できます。朝起きたときや夜寝る前など、習慣化すると良いでしょう。
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <Link
                      href="/"
                      className={buttonVariants({
                        variant: "outline",
                        className:
                          "text-pink-400 border-pink-200 hover:bg-pink-50",
                      })}
                    >
                      記録を追加する
                    </Link>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}
