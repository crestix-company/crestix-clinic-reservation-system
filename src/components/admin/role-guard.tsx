"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDemoStore, type DemoRole } from "@/components/admin/demo-store";
import type { ReactNode } from "react";

export function RoleGuard({ allowed, children }: { allowed: DemoRole[]; children: ReactNode }) {
  const { role } = useDemoStore();
  if (allowed.includes(role)) return <>{children}</>;

  return (
    <Card className="mx-auto mt-16 max-w-xl">
      <CardContent className="space-y-4 p-8 text-center">
        <ShieldAlert className="mx-auto size-10 text-amber-600" />
        <div>
          <h1 className="text-xl font-semibold">この画面を閲覧する権限がありません</h1>
          <p className="mt-2 text-sm text-muted-foreground">現在のデモロールではこの画面を表示しません。本番ではログインユーザーのロールでアクセス制御します。</p>
        </div>
        <Link href="/admin" className={buttonVariants()}>本日の予約・受付へ戻る</Link>
      </CardContent>
    </Card>
  );
}
