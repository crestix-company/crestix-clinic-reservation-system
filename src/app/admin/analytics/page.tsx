"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReservationTypeChart } from "@/components/dashboard/reservation-type-chart";
import { ReservationSourceChart } from "@/components/dashboard/reservation-source-chart";
import { getMonthlyAnalytics } from "@/lib/services/analytics-service";

export default function AnalyticsPage() {
  const analytics = useMemo(() => getMonthlyAnalytics(), []);

  const maxBySourceInRow = (row: (typeof analytics.matrix)[number]) => Math.max(...row.bySource.map((s) => s.count), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">集計</h1>
        <p className="text-sm text-muted-foreground">予約を一元管理すると、何の予約がどこから入っているかが一目で分かります</p>
      </div>

      <Card className="w-fit">
        <CardContent className="px-6 py-5">
          <div className="text-sm text-muted-foreground">今月の予約総数</div>
          <div className="mt-1 text-3xl font-semibold tabular-nums">{analytics.totalCount}件</div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>予約内容別</CardTitle>
            <CardDescription>今月の予約メニューごとの件数</CardDescription>
          </CardHeader>
          <CardContent>
            <ReservationTypeChart data={analytics.byType} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>予約経路別</CardTitle>
            <CardDescription>今月、どこから予約が入ったか</CardDescription>
          </CardHeader>
          <CardContent>
            <ReservationSourceChart data={analytics.bySource} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>予約内容 × 予約経路</CardTitle>
          <CardDescription>どの予約メニューが、どの経路から何件入っているか</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {analytics.matrix.map((row) => (
            <div key={row.reservationTypeId} className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="font-medium">{row.typeName}</span>
                <span className="text-sm text-muted-foreground">全{row.total}件</span>
              </div>
              <div className="space-y-1.5">
                {row.bySource.map((s) => (
                  <div key={s.source} className="flex items-center gap-3 text-sm">
                    <span className="w-20 shrink-0 text-muted-foreground">{s.label}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(s.count / maxBySourceInRow(row)) * 100}%` }}
                      />
                    </div>
                    <span className="w-10 shrink-0 text-right tabular-nums">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
