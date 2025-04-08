import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sun, CloudSun, Cloud, Cloudy, Droplets } from "lucide-react";

const MOODS = [
  {
    value: 0,
    label: "最高",
    icon: Sun,
    color: "text-amber-500",
    bgColor: "bg-amber-50",
  },
  {
    value: 1,
    label: "良い",
    icon: CloudSun,
    color: "text-sky-400",
    bgColor: "bg-sky-50",
  },
  {
    value: 2,
    label: "普通",
    icon: Cloud,
    color: "text-gray-400",
    bgColor: "bg-gray-50",
  },
  {
    value: 3,
    label: "少し悪い",
    icon: Cloudy,
    color: "text-indigo-400",
    bgColor: "bg-indigo-50",
  },
  {
    value: 4,
    label: "悪い",
    icon: Droplets,
    color: "text-purple-400",
    bgColor: "bg-purple-50",
  },
];

const SUGGESTED_TAGS = [
  "睡眠不足",
  "仕事",
  "運動",
  "食事",
  "天気",
  "家族",
  "友達",
  "趣味",
  "ストレス",
  "リラックス",
];

const MAX_MEMO_LENGTH = 200;

export function MoodLogger() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [memo, setMemo] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");

  const handleMoodSelect = (value: number) => {
    setSelectedMood(value);
  };

  const handleTagSelect = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleCustomTagAdd = () => {
    if (customTag && !tags.includes(customTag)) {
      setTags((prev) => [...prev, customTag]);
      setCustomTag("");
    }
  };

  const handleSubmit = async () => {
    if (selectedMood === null) {
      alert("気分を選択してください");
      return;
    }

    try {
      const response = await fetch("/api/mood", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          moodValue: selectedMood,
          note: memo,
          tags,
        }),
      });

      if (!response.ok) {
        throw new Error("気分の記録に失敗しました");
      }

      // Reset form
      setSelectedMood(null);
      setMemo("");
      setTags([]);
      alert("気分を記録しました");
    } catch (error) {
      alert("エラーが発生しました");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4 text-[#5d5a55]">
        今日の気分を記録
      </h2>

      {/* Mood Selection */}
      <div className="mb-6">
        <p className="text-sm text-[#5d5a55] mb-2">気分を選択してください</p>
        <div className="grid grid-cols-5 gap-2">
          {MOODS.map((mood) => {
            const Icon = mood.icon;
            return (
              <button
                key={mood.value}
                onClick={() => handleMoodSelect(mood.value)}
                className={`p-2 rounded-lg transition-colors ${
                  selectedMood === mood.value
                    ? `${mood.bgColor} ${mood.color} ring-2 ring-pink-200`
                    : "hover:bg-gray-50"
                }`}
              >
                <Icon className="w-6 h-6 mx-auto" />
                <span className="text-xs mt-1 block">{mood.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Memo Input */}
      <div className="mb-6">
        <label className="block text-sm text-[#5d5a55] mb-2">
          メモ ({memo.length}/{MAX_MEMO_LENGTH})
        </label>
        <Textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value.slice(0, MAX_MEMO_LENGTH))}
          placeholder="今日の気分についてメモを残しましょう..."
          className="resize-none"
          rows={3}
        />
      </div>

      {/* Tags */}
      <div className="mb-6">
        <label className="block text-sm text-[#5d5a55] mb-2">タグ</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {SUGGESTED_TAGS.map((tag) => (
            <Badge
              key={tag}
              variant={tags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => handleTagSelect(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            placeholder="新しいタグを追加"
            className="flex-1 px-3 py-1 text-sm border rounded-md"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleCustomTagAdd}
            disabled={!customTag}
          >
            追加
          </Button>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        className="w-full bg-pink-400 hover:bg-pink-500 text-white"
        onClick={handleSubmit}
        disabled={selectedMood === null}
      >
        記録する
      </Button>
    </div>
  );
}
