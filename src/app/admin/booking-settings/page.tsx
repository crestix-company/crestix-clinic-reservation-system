"use client";

import { HelpCircle, Plus } from "lucide-react";
import { useDemoStore } from "@/components/admin/demo-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function HelpPopover({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-label={`${title}の説明`}
        className="inline-flex size-6 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <HelpCircle className="size-4" />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 hidden w-72 -translate-x-1/2 rounded-lg border bg-popover p-3 text-left text-sm font-normal leading-6 text-popover-foreground shadow-lg group-hover:block group-focus-within:block"
      >
        <span className="mb-1 block font-semibold">{title}</span>
        <span className="block text-muted-foreground">{children}</span>
      </span>
    </span>
  );
}

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <CardTitle>{title}</CardTitle>
      <HelpPopover title={title}>{description}</HelpPopover>
    </div>
  );
}

export default function BookingSettingsPage() {
  const { doctors, types, schedule, setDoctors, setTypes, setSchedule } = useDemoStore();

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">予約枠・診療設定</h1>
          <HelpPopover title="この画面でできること">
            医院ごとの予約ルールを設定する画面です。担当医、診療時間、休診日、予約メニュー、所要時間、1枠の定員などを変更できます。設定内容は予約カレンダーや管理画面のデモ表示に反映されます。
          </HelpPopover>
        </div>
        <p className="text-sm text-muted-foreground">
          医院の運用に合わせて、予約を受け付ける条件や表示内容を設定します。
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <SectionTitle
              title="医師一覧"
              description={
                <>
                  予約を担当する医師を登録・編集します。名称や役割を変更でき、「有効」を外すと新しい予約の担当候補から外す想定です。
                </>
              }
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setDoctors((current) => [
                  ...current,
                  {
                    id: `dr-demo-${Date.now()}`,
                    clinicId: current[0]?.clinicId ?? "clinic-kawaratani",
                    name: "新しい医師",
                    role: "担当医",
                    active: true,
                  },
                ])
              }
            >
              <Plus className="size-4" />
              医師を追加
            </Button>
          </CardHeader>

          <CardContent className="space-y-3">
            <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs leading-5 text-muted-foreground">
              例：院長、非常勤医師などを登録し、予約カレンダー上で担当医ごとに予約状況を確認できます。
            </p>

            {doctors.map((doctor) => (
              <div key={doctor.id} className="flex items-center gap-2">
                <Input
                  aria-label={`${doctor.name}の名前`}
                  value={doctor.name}
                  onChange={(event) =>
                    setDoctors((current) =>
                      current.map((item) =>
                        item.id === doctor.id ? { ...item, name: event.target.value } : item,
                      ),
                    )
                  }
                />
                <Input
                  aria-label={`${doctor.name}の役割`}
                  className="w-28"
                  value={doctor.role}
                  onChange={(event) =>
                    setDoctors((current) =>
                      current.map((item) =>
                        item.id === doctor.id ? { ...item, role: event.target.value } : item,
                      ),
                    )
                  }
                />
                <label className="flex shrink-0 items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={doctor.active}
                    onChange={(event) =>
                      setDoctors((current) =>
                        current.map((item) =>
                          item.id === doctor.id ? { ...item, active: event.target.checked } : item,
                        ),
                      )
                    }
                  />
                  有効
                  <HelpPopover title="有効">
                    ONの医師を予約時の担当候補として使用します。長期休診・退職などで予約を受け付けない場合はOFFにする想定です。
                  </HelpPopover>
                </label>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <SectionTitle
              title="診療時間・休診日"
              description={
                <>
                  医院全体の基本診療時間と休診日を設定します。患者向けWEB予約や管理側の空き枠判定で使用する想定です。
                </>
              }
            />
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(["morningStart", "morningEnd", "afternoonStart", "afternoonEnd"] as const).map(
                (key, index) => (
                  <div key={key}>
                    <Label htmlFor={key}>
                      {["午前 開始", "午前 終了", "午後 開始", "午後 終了"][index]}
                    </Label>
                    <Input
                      id={key}
                      type="time"
                      value={schedule[key]}
                      onChange={(event) =>
                        setSchedule((current) => ({ ...current, [key]: event.target.value }))
                      }
                    />
                  </div>
                ),
              )}
            </div>

            <div>
              <div className="flex items-center gap-1">
                <Label>休診日</Label>
                <HelpPopover title="休診日">
                  予約を受け付けない曜日を指定します。曜日ごとの細かな診療時間や臨時休診は、今後別設定として拡張できます。
                </HelpPopover>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                {WEEKDAYS.map((day, index) => (
                  <label key={day} className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={schedule.closedDays.includes(index)}
                      onChange={(event) =>
                        setSchedule((current) => ({
                          ...current,
                          closedDays: event.target.checked
                            ? [...current.closedDays, index]
                            : current.closedDays.filter((value) => value !== index),
                        }))
                      }
                    />
                    {day}曜日
                  </label>
                ))}
              </div>
            </div>

            <div className="max-w-52">
              <div className="flex items-center gap-1">
                <Label htmlFor="booking-days">予約受付期間（日）</Label>
                <HelpPopover title="予約受付期間">
                  今日から何日先まで患者が予約できるかを設定します。例：30日にすると、原則30日先までを予約対象にする想定です。
                </HelpPopover>
              </div>
              <Input
                id="booking-days"
                type="number"
                min={1}
                value={schedule.bookingDays}
                onChange={(event) =>
                  setSchedule((current) => ({ ...current, bookingDays: Number(event.target.value) }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <SectionTitle
              title="診療メニュー・予約枠"
              description={
                <>
                  患者が選ぶ予約メニューと、その予約枠の基本ルールを設定します。各メニューの所要時間・同時間帯の定員・カレンダー上の表示色・利用可否を管理します。
                </>
              }
            />
          </CardHeader>

          <CardContent className="space-y-3">
            <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs leading-5 text-muted-foreground">
              例：胃カメラ「30分・1枠2名」、一般診察「15分・1枠3名」のように、診療内容ごとの予約条件を設定します。
            </p>

            {types.map((type) => (
              <div
                key={type.id}
                className="grid grid-cols-2 gap-2 rounded-lg border p-3 sm:grid-cols-[minmax(160px,1fr)_120px_120px_100px_90px] sm:items-end"
              >
                <div>
                  <Label htmlFor={`name-${type.id}`}>診療メニュー</Label>
                  <Input
                    id={`name-${type.id}`}
                    value={type.name}
                    onChange={(event) =>
                      setTypes((current) =>
                        current.map((item) =>
                          item.id === type.id ? { ...item, name: event.target.value } : item,
                        ),
                      )
                    }
                  />
                </div>

                <div>
                  <div className="flex items-center gap-1">
                    <Label htmlFor={`duration-${type.id}`}>所要時間（分）</Label>
                    <HelpPopover title="所要時間">
                      この予約メニュー1件あたりに確保する標準時間です。カレンダー上の予約枠や空き時間判定に使用する想定です。
                    </HelpPopover>
                  </div>
                  <Input
                    id={`duration-${type.id}`}
                    type="number"
                    min={5}
                    step={5}
                    value={type.durationMinutes ?? 30}
                    onChange={(event) =>
                      setTypes((current) =>
                        current.map((item) =>
                          item.id === type.id
                            ? { ...item, durationMinutes: Number(event.target.value) }
                            : item,
                        ),
                      )
                    }
                  />
                </div>

                <div>
                  <div className="flex items-center gap-1">
                    <Label htmlFor={`capacity-${type.id}`}>枠の定員</Label>
                    <HelpPopover title="枠の定員">
                      同じ時間帯に受け付けられる予約件数です。医師・検査室・設備の運用に合わせて設定します。
                    </HelpPopover>
                  </div>
                  <Input
                    id={`capacity-${type.id}`}
                    type="number"
                    min={1}
                    value={type.capacity ?? 1}
                    onChange={(event) =>
                      setTypes((current) =>
                        current.map((item) =>
                          item.id === type.id ? { ...item, capacity: Number(event.target.value) } : item,
                        ),
                      )
                    }
                  />
                </div>

                <div>
                  <div className="flex items-center gap-1">
                    <Label htmlFor={`color-${type.id}`}>表示色</Label>
                    <HelpPopover title="表示色">
                      予約カレンダー上で診療メニューを見分けやすくするための色です。予約条件そのものには影響しません。
                    </HelpPopover>
                  </div>
                  <Input
                    id={`color-${type.id}`}
                    type="color"
                    value={type.color ?? "#64748b"}
                    onChange={(event) =>
                      setTypes((current) =>
                        current.map((item) =>
                          item.id === type.id ? { ...item, color: event.target.value } : item,
                        ),
                      )
                    }
                  />
                </div>

                <label className="flex items-center gap-1 pb-2 text-xs">
                  <input
                    type="checkbox"
                    checked={type.active}
                    onChange={(event) =>
                      setTypes((current) =>
                        current.map((item) =>
                          item.id === type.id ? { ...item, active: event.target.checked } : item,
                        ),
                      )
                    }
                  />
                  有効
                  <HelpPopover title="有効">
                    ONの診療メニューを予約受付の対象として使用します。季節限定メニューや一時停止中の診療はOFFにする想定です。
                  </HelpPopover>
                </label>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
