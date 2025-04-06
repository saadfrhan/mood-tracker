"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Image, Paperclip, Send, Cherry } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"
import { format, parseISO } from "date-fns"
import { ja } from "date-fns/locale"
import { UserNav } from "@/components/user-nav"
import { useSession } from "next-auth/react"
import { toast } from "@/components/ui/use-toast"

interface JournalEntry {
  id: string
  date: string
  content: string
}

export default function JournalPage() {
  const { data: session, status } = useSession()
  const [journalText, setJournalText] = useState("")
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch journal entries
  useEffect(() => {
    const fetchJournalEntries = async () => {
      if (status !== "authenticated") return

      try {
        setIsLoading(true)
        const response = await fetch("/api/journal")

        if (!response.ok) {
          throw new Error("Failed to fetch journal entries")
        }

        const data = await response.json()
        setJournalEntries(data)
      } catch (error) {
        console.error("Error fetching journal entries:", error)
        toast({
          title: "エラーが発生しました",
          description: "日記の取得に失敗しました。",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchJournalEntries()
  }, [status])

  const handleSubmit = async () => {
    if (!journalText.trim()) return

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/journal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: journalText,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save journal entry")
      }

      const newEntry = await response.json()

      setJournalEntries([newEntry, ...journalEntries])
      setJournalText("")

      toast({
        title: "日記を保存しました",
        description: "日記が正常に保存されました。",
      })
    } catch (error) {
      console.error("Error saving journal entry:", error)
      toast({
        title: "エラーが発生しました",
        description: "日記の保存に失敗しました。",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <header className="border-b border-[#e7e0d8] bg-white/50 backdrop-blur-sm sticky top-0 z-10 h-16">
        <div className="container flex items-center justify-between h-full px-4 md:px-6">
          <div className="flex items-center gap-2 md:hidden">
            <Cherry className="w-5 h-5 text-pink-400" />
            <span className="text-lg font-medium text-[#5d5a55]">日記</span> {/* English: Journal */}
          </div>
          <div className="hidden md:block">
            <h1 className="text-xl font-medium text-[#5d5a55]">日記</h1> {/* English: Journal */}
          </div>
          <div className="flex items-center gap-4">
            <UserNav />
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8 px-4 md:px-6 max-w-3xl">
        <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-[#5d5a55]">新しい日記</CardTitle> {/* English: New Journal */}
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="今日はどんな一日でしたか？" /* English: How was your day today? */
              className="min-h-[120px] resize-none border-[#e7e0d8] focus-visible:ring-pink-200"
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              disabled={isSubmitting}
            />

            <div className="flex justify-between mt-4">
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="h-9 w-9 border-[#e7e0d8]" disabled={isSubmitting}>
                  <Image className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-9 w-9 border-[#e7e0d8]" disabled={isSubmitting}>
                  <Paperclip className="h-4 w-4" />
                </Button>
              </div>
              <Button
                className="bg-pink-400 hover:bg-pink-500 text-white"
                onClick={handleSubmit}
                disabled={!journalText.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>保存中...</span> {/* English: Saving... */}
                  </div>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    保存 {/* English: Save */}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500"></div>
          </div>
        ) : journalEntries.length > 0 ? (
          <div className="space-y-4">
            {journalEntries.map((entry) => (
              <Card key={entry.id} className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-[#5d5a55] flex justify-between items-center">
                    <span>{format(parseISO(entry.date), "yyyy年MM月dd日 (EEEE)", { locale: ja })}</span>
                    <span className="text-xs text-muted-foreground">{format(parseISO(entry.date), "HH:mm")}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{entry.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">日記がまだありません。新しい日記を書いてみましょう。</p>
            {/* English: No journal entries yet. Let's write a new one. */}
          </div>
        )}
      </main>
    </>
  )
}

