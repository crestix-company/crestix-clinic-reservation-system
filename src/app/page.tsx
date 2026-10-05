import Link from "next/link";
import { LayoutDashboard, Smartphone, Tv } from "lucide-react";

const ENTRIES = [
  {
    href: "/admin",
    title: "予約管理ダッシュボード",
    description: "受付スタッフ向け管理画面。本日の予約状況を一元確認できます。",
    icon: LayoutDashboard,
  },
  {
    href: "/reserve",
    title: "患者向けWeb予約",
    description: "スマートフォンから予約内容・日時を選んで予約できます。",
    icon: Smartphone,
  },
  {
    href: "/display",
    title: "院内モニター",
    description: "待合室のモニターに表示する、呼出番号の案内画面です。",
    icon: Tv,
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-muted/30 px-6 py-16">
      <div className="w-full max-w-2xl space-y-8">
        <div className="space-y-2 text-center">
          <p className="text-sm font-medium text-primary">瓦谷クリニック 予約管理システム</p>
          <h1 className="text-2xl font-semibold tracking-tight">UIデモ</h1>
          <p className="text-sm text-muted-foreground">
            予約一元管理のイメージをご確認いただくためのデモ画面です。すべてモックデータで動作します。
          </p>
        </div>

        <div className="grid gap-4">
          {ENTRIES.map((entry) => (
            <Link
              key={entry.href}
              href={entry.href}
              className="flex items-center gap-4 rounded-xl border bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <entry.icon className="size-5" />
              </div>
              <div className="flex-1">
                <div className="font-medium">{entry.title}</div>
                <div className="text-sm text-muted-foreground">{entry.description}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
