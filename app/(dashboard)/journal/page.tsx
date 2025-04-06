"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Send,
  Cherry,
  Save,
  Search,
  Calendar,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useRef } from "react";
import {
  format,
  parseISO,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
} from "date-fns";
import { ja } from "date-fns/locale";
import { UserNav } from "@/components/user-nav";
import { useSession } from "next-auth/react";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface JournalEntry {
  id: string;
  date: string;
  content: string;
}

export default function JournalPage() {
  const { status } = useSession();
  const [journalText, setJournalText] = useState("");
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch journal entries
  useEffect(() => {
    const fetchJournalEntries = async () => {
      if (status !== "authenticated") return;

      try {
        setIsLoading(true);
        const response = await fetch("/api/journal");

        if (!response.ok) {
          throw new Error("Failed to fetch journal entries");
        }

        const data = await response.json();
        setJournalEntries(data);
      } catch (error) {
        console.error("Error fetching journal entries:", error);
        toast({
          title: "エラーが発生しました",
          description: "日記の取得に失敗しました。",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchJournalEntries();
  }, [status]);

  // Auto-save functionality
  useEffect(() => {
    if (journalText.trim() && isDirty) {
      // Clear any existing timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      // Set a new timer for auto-save (3 seconds after typing stops)
      autoSaveTimerRef.current = setTimeout(() => {
        handleAutoSave();
      }, 3000);
    }

    // Cleanup function
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [journalText, isDirty]);

  const handleAutoSave = async () => {
    if (!journalText.trim()) return;

    try {
      const response = await fetch("/api/journal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: journalText,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to auto-save journal entry");
      }

      const newEntry = await response.json();

      // Update entries list
      setJournalEntries([newEntry, ...journalEntries]);
      setLastSaved(new Date());
      setIsDirty(false);

      // Show a subtle toast notification
      toast({
        title: "自動保存しました",
        description: "日記が自動保存されました。",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error auto-saving journal entry:", error);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJournalText(e.target.value);
    setIsDirty(true);
  };

  const handleManualSave = async () => {
    if (!journalText.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/journal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: journalText,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save journal entry");
      }

      const newEntry = await response.json();

      setJournalEntries([newEntry, ...journalEntries]);
      setJournalText("");
      setLastSaved(new Date());
      setIsDirty(false);
      setSelectedEntry(null);

      toast({
        title: "日記を保存しました",
        description: "日記が正常に保存されました。",
      });
    } catch (error) {
      console.error("Error saving journal entry:", error);
      toast({
        title: "エラーが発生しました",
        description: "日記の保存に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEntryClick = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setJournalText(entry.content);
    setIsDirty(false);
  };

  const getEntryDateLabel = (date: string) => {
    const entryDate = parseISO(date);

    if (isToday(entryDate)) {
      return "今日";
    } else if (isYesterday(entryDate)) {
      return "昨日";
    } else if (isThisWeek(entryDate)) {
      return format(entryDate, "EEEE", { locale: ja });
    } else if (isThisMonth(entryDate)) {
      return format(entryDate, "M月d日", { locale: ja });
    } else {
      return format(entryDate, "yyyy年M月", { locale: ja });
    }
  };

  const filteredEntries = journalEntries.filter(
    (entry) =>
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      format(parseISO(entry.date), "yyyy年MM月dd日", { locale: ja })
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  // Group entries by date
  const groupedEntries = filteredEntries.reduce((groups, entry) => {
    const date = parseISO(entry.date);
    const label = getEntryDateLabel(entry.date);

    if (!groups[label]) {
      groups[label] = [];
    }

    groups[label].push(entry);
    return groups;
  }, {} as Record<string, JournalEntry[]>);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-[#e7e0d8] bg-white/50 backdrop-blur-sm sticky top-0 z-10 h-14">
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
              {/* journal in japanese */}
              日記
            </h1>{" "}
            {/* English: Dashboard */}
          </div>
          <div className="flex items-center gap-4">
            <UserNav />
          </div>
        </div>
      </header>

      <div className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <div className="grid gap-6 lg:grid-cols-12">
            {/* New Journal Entry Section - Notepad Style */}
            <div className="lg:col-span-8">
              <div className="relative">
                <div className="absolute -top-2 -left-2 -right-2 -bottom-2 bg-muted/30 rounded-lg"></div>
                <div className="relative bg-white dark:bg-slate-900 shadow-md rounded-lg overflow-hidden">
                  <div className="border-b px-4 py-3 flex justify-between items-center">
                    <h2 className="font-medium">
                      {selectedEntry ? "日記を編集" : "新しい日記"}
                    </h2>
                    <div className="flex items-center gap-2">
                      {isDirty && (
                        <span className="text-xs text-muted-foreground animate-pulse">
                          未保存
                        </span>
                      )}
                      {lastSaved && !isDirty && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Save className="h-3 w-3" />
                          保存済み
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <Textarea
                      placeholder="今日はどんな一日でしたか？"
                      className={cn(
                        "min-h-[400px] resize-none border-0 p-0",
                        "bg-transparent focus-visible:ring-0",
                        "placeholder:text-muted-foreground",
                        "text-base leading-relaxed"
                      )}
                      value={journalText}
                      onChange={handleTextChange}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="border-t px-4 py-3 flex justify-between items-center">
                    {selectedEntry && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedEntry(null);
                          setJournalText("");
                          setIsDirty(false);
                        }}
                      >
                        新規作成
                      </Button>
                    )}
                    <div className="ml-auto">
                      <Button
                        onClick={handleManualSave}
                        disabled={!journalText.trim() || isSubmitting}
                        variant="outline"
                        size="sm"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                            <span>保存中...</span>
                          </div>
                        ) : (
                          <>
                            <Send className="h-3 w-3 mr-1" />
                            保存
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Improved Journal Entries Sidebar */}
            <div className="lg:col-span-4">
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">過去の日記</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="日記を検索..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    {isLoading ? (
                      <div className="flex justify-center items-center py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500"></div>
                      </div>
                    ) : journalEntries.length > 0 ? (
                      <Tabs defaultValue="recent" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="recent">最近</TabsTrigger>
                          <TabsTrigger value="all">すべて</TabsTrigger>
                        </TabsList>
                        <TabsContent value="recent" className="mt-2">
                          <div className="space-y-4">
                            {Object.entries(groupedEntries)
                              .slice(0, 5)
                              .map(([label, entries]) => (
                                <div key={label} className="space-y-2">
                                  <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                    {label === "今日" ? (
                                      <Clock className="h-3 w-3" />
                                    ) : (
                                      <Calendar className="h-3 w-3" />
                                    )}
                                    {label}
                                  </h3>
                                  <div className="space-y-1">
                                    {entries.map((entry) => (
                                      <button
                                        key={entry.id}
                                        onClick={() => handleEntryClick(entry)}
                                        className={cn(
                                          "w-full text-left p-2 rounded-md text-sm transition-colors",
                                          "hover:bg-muted/50",
                                          selectedEntry?.id === entry.id
                                            ? "bg-muted"
                                            : ""
                                        )}
                                      >
                                        <div className="flex justify-between items-center">
                                          <span className="truncate max-w-[180px]">
                                            {entry.content.substring(0, 30)}
                                            {entry.content.length > 30
                                              ? "..."
                                              : ""}
                                          </span>
                                          <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </TabsContent>
                        <TabsContent value="all" className="mt-2">
                          <div className="space-y-4">
                            {Object.entries(groupedEntries).map(
                              ([label, entries]) => (
                                <div key={label} className="space-y-2">
                                  <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {label}
                                  </h3>
                                  <div className="space-y-1">
                                    {entries.map((entry) => (
                                      <button
                                        key={entry.id}
                                        onClick={() => handleEntryClick(entry)}
                                        className={cn(
                                          "w-full text-left p-2 rounded-md text-sm transition-colors",
                                          "hover:bg-muted/50",
                                          selectedEntry?.id === entry.id
                                            ? "bg-muted"
                                            : ""
                                        )}
                                      >
                                        <div className="flex justify-between items-center">
                                          <span className="truncate max-w-[180px]">
                                            {entry.content.substring(0, 30)}
                                            {entry.content.length > 30
                                              ? "..."
                                              : ""}
                                          </span>
                                          <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </TabsContent>
                      </Tabs>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          日記がまだありません。新しい日記を書いてみましょう。
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
