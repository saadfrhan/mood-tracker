import { Metadata } from "next";

export const metadata: Metadata = {
  title: "こころ日記 | メンタルヘルス改善のための気分トラッカー",
  description:
    "日々の気分を記録し、感情のパターンを理解し、メンタルヘルスを改善するためのアプリ。気分の変化を追跡し、心の健康を向上させましょう。",
  keywords:
    "メンタルヘルス, 気分トラッカー, 心の健康, 感情記録, メンタルケア, こころの健康",
  openGraph: {
    title: "こころ日記 | メンタルヘルス改善のための気分トラッカー",
    description:
      "日々の気分を記録し、感情のパターンを理解し、メンタルヘルスを改善するためのアプリ。",
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "こころ日記 | メンタルヘルス改善のための気分トラッカー",
    description:
      "日々の気分を記録し、感情のパターンを理解し、メンタルヘルスを改善するためのアプリ。",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://heart-diary.com",
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f8f6f2]">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 text-[#5d5a55]">こころ日記</h1>
          <p className="text-xl mb-8 text-[#5d5a55]">
            日々の気分を記録し、感情のパターンを理解し、
            メンタルヘルスを改善しましょう。
          </p>

          <section className="space-y-6">
            <article className="bg-white/80 backdrop-blur-sm p-6 rounded-lg border border-[#e7e0d8] shadow-sm">
              <h2 className="text-2xl font-semibold mb-4 text-pink-400">
                近日公開
              </h2>
              <p className="text-[#5d5a55] mb-4">
                現在開発中です。もうしばらくお待ちください！
              </p>
            </article>

            <section className="grid md:grid-cols-3 gap-6 mt-12">
              <article className="bg-white/80 backdrop-blur-sm p-6 rounded-lg border border-[#e7e0d8] shadow-sm">
                <h3 className="text-xl font-semibold mb-3 text-pink-400">
                  気分を記録
                </h3>
                <p className="text-[#5d5a55]">
                  一日を通して感情の変化を記録し、モニタリングします
                </p>
              </article>
              <article className="bg-white/80 backdrop-blur-sm p-6 rounded-lg border border-[#e7e0d8] shadow-sm">
                <h3 className="text-xl font-semibold mb-3 text-pink-400">
                  パターンを分析
                </h3>
                <p className="text-[#5d5a55]">
                  感情の傾向やトリガーを発見し、理解を深めます
                </p>
              </article>
              <article className="bg-white/80 backdrop-blur-sm p-6 rounded-lg border border-[#e7e0d8] shadow-sm">
                <h3 className="text-xl font-semibold mb-3 text-pink-400">
                  心の健康を改善
                </h3>
                <p className="text-[#5d5a55]">
                  メンタルヘルス向上のための洞察とアドバイスを提供します
                </p>
              </article>
            </section>
          </section>
        </div>
      </main>
    </div>
  );
}
