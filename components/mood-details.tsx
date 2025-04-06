"use client"

import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Cloud, CloudSun, Cloudy, Droplets, Sun, Tag } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface MoodDetailsProps {
  date: Date
  moodValue: number
  note?: string
  tags?: string[]
}

export function MoodDetails({ date, moodValue, note, tags = [] }: MoodDetailsProps) {
  const moods = [
    {
      icon: Sun,
      label: "最高" /* English: Excellent */,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
    },
    {
      icon: CloudSun,
      label: "良い" /* English: Good */,
      color: "text-sky-400",
      bgColor: "bg-sky-50",
    },
    {
      icon: Cloud,
      label: "普通" /* English: Normal */,
      color: "text-gray-400",
      bgColor: "bg-gray-50",
    },
    {
      icon: Cloudy,
      label: "少し悪い" /* English: Slightly Bad */,
      color: "text-indigo-400",
      bgColor: "bg-indigo-50",
    },
    {
      icon: Droplets,
      label: "悪い" /* English: Bad */,
      color: "text-purple-400",
      bgColor: "bg-purple-50",
    },
  ]

  const mood = moods[moodValue]
  const MoodIcon = mood.icon

  return (
    <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-[#5d5a55] flex justify-between items-center">
          <span>{format(date, "yyyy年MM月dd日 (EEEE)", { locale: ja })}</span>
          <span className="text-xs text-muted-foreground">{format(date, "HH:mm")}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full ${mood.bgColor} flex items-center justify-center`}>
            <MoodIcon className={`w-6 h-6 ${mood.color}`} />
          </div>
          <div>
            <p className="font-medium">{mood.label}</p>
            <p className="text-xs text-muted-foreground">{format(date, "MM月dd日")}の気分</p>{" "}
            {/* English: [date]'s mood */}
          </div>
        </div>

        {note && (
          <div className="pt-2 border-t border-[#e7e0d8]">
            <p className="text-sm whitespace-pre-wrap">{note}</p>
          </div>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

