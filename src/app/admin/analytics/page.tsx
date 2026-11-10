"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReservationTypeChart } from "@/components/dashboard/reservation-type-chart";
import { ReservationSourceChart } from "@/components/dashboard/reservation-source-chart";
import { getMonthlyAnalytics } from "@/lib/services/analytics-service";
import { useDemoStore } from "@/components/admin/demo-store";
import { getToday } from "@/lib/services/reservation-service";

export default function AnalyticsPage() {
  const { reservations, types } = useDemoStore();
  const analytics = useMemo(() => getMonthlyAnalytics(getToday(), reservations, types), [reservations, types]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">予約集計</h1>
        <p className="text-sm text-muted-foreground">予約数と予約経路を診療メニューごとに比較できます</p>
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

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">診療メニュー別 予約経路</h2>
          <p className="text-sm text-muted-foreground">
            診療メニューごとに領域を分け、どの経路から何件入っているかを比較します
          </p>
        </div>

        <div className="grid grid-cols-1 overflow-hidden rounded-xl border bg-border gap-px lg:grid-cols-2">
          {analytics.matrix.map((row) => {
            const max = Math.max(...row.bySource.map((source) => source.count), 1);
            return (
              <div key={row.reservationTypeId} className="min-h-[280px] bg-card p-5">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{row.typeName}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">予約経路別内訳</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">合計</div>
                    <div className="text-xl font-semibold tabular-nums">{row.total}件</div>
                  </div>
                </div>

                <div className="space-y-3">
                  {row.bySource.map((source) => (
                    <div key={source.source} className="grid grid-cols-[88px_minmax(0,1fr)_40px] items-center gap-3 text-sm">
                      <span className="truncate text-muted-foreground">{source.label}</span>
                      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${(source.count / max) * 100}%` }}
                        />
                      </div>
                      <span className="text-right font-medium tabular-nums">{source.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
