"use client"

import React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Cloud, CloudSun, Cloudy, Droplets, Sun, Cherry } from "lucide-react"
import { UserNav } from "@/components/user-nav"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { toast } from "@/components/ui/use-toast"
import { format, parseISO, subDays, startOfMonth, endOfMonth } from "date-fns"

interface MoodEntry {
  id: string
  date: string
  moodValue: number
  note?: string
  tags?: string[]
}

interface MoodDistribution {
  moodValue: number
  count: number
  percentage: number
}

interface WeeklyTrend {
  day: string
  value: number
  moodValue?: number
}

interface MoodFactor {
  factor: string
  impact: number
}

export default function StatsPage() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [moodDistribution, setMoodDistribution] = useState<MoodDistribution[]>([])
  const [weeklyTrends, setWeeklyTrends] = useState<WeeklyTrend[]>([])
  const [moodFactors, setMoodFactors] = useState<MoodFactor[]>([])

  const moods = [
    { label: "最高", icon: Sun, color: "text-amber-500", bgColor: "bg-amber-50" },
    { label: "良い", icon: CloudSun, color: "text-sky-400", bgColor: "bg-sky-50" },
    { label: "普通", icon: Cloud, color: "text-gray-400", bgColor: "bg-gray-50" },
    { label: "少し悪い", icon: Cloudy, color: "text-indigo-400", bgColor: "bg-indigo-50" },
    { label: "悪い", icon: Droplets, color: "text-purple-400", bgColor: "bg-purple-50" },
  ]

  useEffect(() => {
    const fetchMoodData = async () => {
      if (status !== "authenticated") return

      try {
        setIsLoading(true)

        // Get the current month's date range
        const today = new Date()
        const firstDayOfMonth = startOfMonth(today)
        const lastDayOfMonth = endOfMonth(today)

        // Fetch mood entries for the current month
        const response = await fetch(
          `/api/mood?startDate=${firstDayOfMonth.toISOString()}&endDate=${lastDayOfMonth.toISOString()}`,
        )

        if (!response.ok) {
          throw new Error("Failed to fetch mood data")
        }

        const moodEntries: MoodEntry[] = await response.json()

        // Calculate mood distribution
        const distribution = calculateMoodDistribution(moodEntries)
        setMoodDistribution(distribution)

        // Calculate weekly trends
        const trends = calculateWeeklyTrends(moodEntries)
        setWeeklyTrends(trends)

        // Calculate mood factors
        const factors = calculateMoodFactors(moodEntries)
        setMoodFactors(factors)
      } catch (error) {
        console.error("Error fetching mood data:", error)
        toast({
          title: "エラーが発生しました",
          description: "統計データの取得に失敗しました。",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchMoodData()
  }, [status])

  // Calculate mood distribution from mood entries
  const calculateMoodDistribution = (entries: MoodEntry[]): MoodDistribution[] => {
    const distribution = Array(5)
      .fill(0)
      .map((_, i) => ({
        moodValue: i,
        count: 0,
        percentage: 0,
      }))

    // Count occurrences of each mood value
    entries.forEach((entry) => {
      if (entry.moodValue >= 0 && entry.moodValue < 5) {
        distribution[entry.moodValue].count++
      }
    })

    // Calculate percentages
    const total = entries.length
    distribution.forEach((item) => {
      item.percentage = total > 0 ? Math.round((item.count / total) * 100) : 0
    })

    return distribution
  }

  // Calculate weekly trends from mood entries
  const calculateWeeklyTrends = (entries: MoodEntry[]): WeeklyTrend[] => {
    const days = ["月", "火", "水", "木", "金", "土", "日"]
    const trends: WeeklyTrend[] = days.map((day) => ({ day, value: 0 }))

    // Get entries from the last 7 days
    const last7Days = Array(7)
      .fill(0)
      .map((_, i) => {
        const date = subDays(new Date(), 6 - i)
        return format(date, "yyyy-MM-dd")
      })

    // Map entries to days
    last7Days.forEach((dateStr, index) => {
      const dayEntries = entries.filter((entry) => {
        const entryDate = format(parseISO(entry.date), "yyyy-MM-dd")
        return entryDate === dateStr
      })

      if (dayEntries.length > 0) {
        // Use the first entry for the day (most recent)
        const entry = dayEntries[0]

        // Map mood values to a 0-100 scale for visualization
        // 0 (bad) = 20, 4 (excellent) = 100
        const moodScore = 20 + (4 - entry.moodValue) * 20

        trends[index].value = moodScore
        trends[index].moodValue = entry.moodValue
      } else {
        // No entry for this day
        trends[index].value = 0
      }
    })

    return trends
  }

  // Calculate mood factors from mood entries
  const calculateMoodFactors = (entries: MoodEntry[]): MoodFactor[] => {
    // Count tag occurrences
    const tagCounts: Record<string, number> = {}
    let totalTags = 0

    entries.forEach((entry) => {
      if (entry.tags && entry.tags.length > 0) {
        entry.tags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
          totalTags++
        })
      }
    })

    // Convert to array and calculate impact percentages
    const factors = Object.entries(tagCounts).map(([factor, count]) => ({
      factor,
      impact: Math.round((count / Math.max(totalTags, 1)) * 100),
    }))

    // Sort by impact (descending)
    return factors.sort((a, b) => b.impact - a.impact).slice(0, 5)
  }

  return (
    <>
      <header className="border-b border-[#e7e0d8] bg-white/50 backdrop-blur-sm sticky top-0 z-10 h-16">
        <div className="container flex items-center justify-between h-full px-4 md:px-6">
          <div className="flex items-center gap-2 md:hidden">
            <Cherry className="w-5 h-5 text-pink-400" />
            <span className="text-lg font-medium text-[#5d5a55]">統計</span> {/* English: Statistics */}
          </div>
          <div className="hidden md:block">
            <h1 className="text-xl font-medium text-[#5d5a55]">統計</h1> {/* English: Statistics */}
          </div>
          <div className="flex items-center gap-4">
            <UserNav />
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8 px-4 md:px-6 max-w-3xl">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500"></div>
          </div>
        ) : (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="overview">概要</TabsTrigger> {/* English: Overview */}
              <TabsTrigger value="trends">傾向</TabsTrigger> {/* English: Trends */}
              <TabsTrigger value="insights">分析</TabsTrigger> {/* English: Analysis */}
            </TabsList>

            <TabsContent value="overview">
              <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm mb-6">
                <CardHeader>
                  <CardTitle className="text-[#5d5a55]">気分の分布</CardTitle> {/* English: Mood Distribution */}
                  <CardDescription>過去30日間の気分の分布</CardDescription>{" "}
                  {/* English: Mood distribution for the past 30 days */}
                </CardHeader>
                <CardContent>
                  {moodDistribution.length > 0 ? (
                    <div className="space-y-4">
                      {moodDistribution.map((item) => {
                        const mood = moods[item.moodValue]
                        const Icon = mood.icon
                        return (
                          <div key={item.moodValue} className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full ${mood.bgColor} flex items-center justify-center`}>
                              <Icon className={`w-5 h-5 ${mood.color}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium">{mood.label}</span>
                                <span className="text-sm text-muted-foreground">
                                  {item.count}日 ({item.percentage}%)
                                </span>
                              </div>
                              <div className="h-2 bg-[#f0ebe5] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-pink-400 rounded-full"
                                  style={{ width: `${item.percentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        まだ気分の記録がありません。気分を記録して統計を確認しましょう。
                      </p>
                      {/* English: No mood records yet. Record your mood to see statistics. */}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends">
              <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm mb-6">
                <CardHeader>
                  <CardTitle className="text-[#5d5a55]">週間傾向</CardTitle> {/* English: Weekly Trends */}
                  <CardDescription>過去7日間の気分の変化</CardDescription>{" "}
                  {/* English: Mood changes over the past 7 days */}
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-end justify-between gap-2">
                    {weeklyTrends.map((item, index) => (
                      <div key={index} className="flex flex-col items-center gap-2 flex-1">
                        <div
                          className={`w-full ${
                            item.value > 0 ? "bg-pink-100" : "bg-gray-100"
                          } rounded-t-md relative`}
                          style={{
                            maxHeight: `${item.value || 0}%`,
                            height: "190px",
                          }}
                        >
                          {item.moodValue !== undefined && (
                            <div className="absolute top-2 left-0 right-0 flex justify-center">
                              {React.createElement(moods[item.moodValue].icon, {
                                className: `w-4 h-4 ${moods[item.moodValue].color}`,
                              })}
                            </div>
                          )}
                          {item.value > 0 && (
                            <div className="absolute bottom-2 left-0 right-0 text-center text-xs font-medium text-pink-700">
                              {item.value}%
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">{item.day}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights">
              <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm mb-6">
                <CardHeader>
                  <CardTitle className="text-[#5d5a55]">気分に影響する要因</CardTitle>{" "}
                  {/* English: Factors Affecting Mood */}
                  <CardDescription>あなたの気分に影響を与える要因の分析</CardDescription>{" "}
                  {/* English: Analysis of factors affecting your mood */}
                </CardHeader>
                <CardContent>
                  {moodFactors.length > 0 ? (
                    <div className="space-y-4">
                      {moodFactors.map((item, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">{item.factor}</span>
                            <span className="text-sm text-muted-foreground">{item.impact}%</span>
                          </div>
                          <div className="h-2 bg-[#f0ebe5] rounded-full overflow-hidden">
                            <div className="h-full bg-pink-400 rounded-full" style={{ width: `${item.impact}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        まだタグ付けされた気分の記録がありません。タグを使って気分を記録しましょう。
                      </p>
                      {/* English: No tagged mood records yet. Use tags when recording your mood. */}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </>
  )
}

