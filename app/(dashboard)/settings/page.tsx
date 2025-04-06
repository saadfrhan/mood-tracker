"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { BellRing, Globe, Moon, Shield, User, Cherry } from "lucide-react"
import { UserNav } from "@/components/user-nav"

export default function SettingsPage() {
  return (
    <>
      <header className="border-b border-[#e7e0d8] bg-white/50 backdrop-blur-sm sticky top-0 z-10 h-16">
        <div className="container flex items-center justify-between h-full px-4 md:px-6">
          <div className="flex items-center gap-2 md:hidden">
            <Cherry className="w-5 h-5 text-pink-400" />
            <span className="text-lg font-medium text-[#5d5a55]">設定</span> {/* English: Settings */}
          </div>
          <div className="hidden md:block">
            <h1 className="text-xl font-medium text-[#5d5a55]">設定</h1> {/* English: Settings */}
          </div>
          <div className="flex items-center gap-4">
            <UserNav />
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8 px-4 md:px-6 max-w-3xl">
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-pink-400" />
                <CardTitle className="text-[#5d5a55]">アカウント設定</CardTitle> {/* English: Account Settings */}
              </div>
              <CardDescription>アカウント情報の管理</CardDescription> {/* English: Manage your account information */}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-1">
                <Label htmlFor="name">名前</Label> {/* English: Name */}
                <div className="text-sm text-muted-foreground">ユーザー</div> {/* English: User */}
              </div>
              <div className="grid gap-1">
                <Label htmlFor="email">メールアドレス</Label> {/* English: Email */}
                <div className="text-sm text-muted-foreground">user@example.com</div>
              </div>
              <Button variant="outline" className="mt-2">
                プロフィールを編集
              </Button>{" "}
              {/* English: Edit Profile */}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BellRing className="w-5 h-5 text-pink-400" />
                <CardTitle className="text-[#5d5a55]">通知設定</CardTitle> {/* English: Notification Settings */}
              </div>
              <CardDescription>通知の受け取り方法を設定</CardDescription>{" "}
              {/* English: Configure how you receive notifications */}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>日次リマインダー</Label> {/* English: Daily Reminder */}
                  <p className="text-sm text-muted-foreground">毎日の気分記録のリマインダー</p>{" "}
                  {/* English: Reminder for daily mood recording */}
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>週間サマリー</Label> {/* English: Weekly Summary */}
                  <p className="text-sm text-muted-foreground">週間の気分分析レポート</p>{" "}
                  {/* English: Weekly mood analysis report */}
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-pink-400" />
                <CardTitle className="text-[#5d5a55]">言語と表示</CardTitle> {/* English: Language and Display */}
              </div>
              <CardDescription>アプリの言語と表示設定</CardDescription>{" "}
              {/* English: App language and display settings */}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>言語</Label> {/* English: Language */}
                  <p className="text-sm text-muted-foreground">日本語</p> {/* English: Japanese */}
                </div>
                <Button variant="outline" size="sm">
                  変更
                </Button>{" "}
                {/* English: Change */}
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>ダークモード</Label> {/* English: Dark Mode */}
                  <p className="text-sm text-muted-foreground">暗い背景でアプリを表示</p>{" "}
                  {/* English: Display app with dark background */}
                </div>
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4" />
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-pink-400" />
                <CardTitle className="text-[#5d5a55]">プライバシーとセキュリティ</CardTitle>{" "}
                {/* English: Privacy and Security */}
              </div>
              <CardDescription>データの保護とセキュリティ設定</CardDescription>{" "}
              {/* English: Data protection and security settings */}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>データのエクスポート</Label> {/* English: Export Data */}
                  <p className="text-sm text-muted-foreground">あなたの記録をダウンロード</p>{" "}
                  {/* English: Download your records */}
                </div>
                <Button variant="outline" size="sm">
                  エクスポート
                </Button>{" "}
                {/* English: Export */}
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>アカウント削除</Label> {/* English: Delete Account */}
                  <p className="text-sm text-muted-foreground">アカウントとすべてのデータを削除</p>{" "}
                  {/* English: Delete your account and all data */}
                </div>
                <Button variant="destructive" size="sm">
                  削除
                </Button>{" "}
                {/* English: Delete */}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}

