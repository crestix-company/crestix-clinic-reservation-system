"use client";

import { CalendarClock, HelpCircle, Plus, Stethoscope, UserRoundCog } from "lucide-react";
import { useDemoStore } from "@/components/admin/demo-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
        className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 hidden w-80 -translate-x-1/2 rounded-lg border bg-popover p-3 text-left text-sm font-normal leading-6 text-popover-foreground shadow-lg group-hover:block group-focus-within:block"
      >
        <span className="mb-1 block font-semibold">{title}</span>
        <span className="block text-muted-foreground">{children}</span>
      </span>
    </span>
  );
}

function SettingHeader({
  title,
  description,
  help,
}: {
  title: string;
  description: string;
  help?: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <h2 className="text-lg font-semibold">{title}</h2>
        {help ? <HelpPopover title={title}>{help}</HelpPopover> : null}
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function SettingImpact({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-muted/30 px-3 py-2 text-xs leading-5 text-muted-foreground">
      <span className="font-medium text-foreground">この設定が反映される場所：</span>
      {children}
    </div>
  );
}

export default function BookingSettingsPage() {
  const { doctors, types, schedule, setDoctors, setTypes, setSchedule } = useDemoStore();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-2xl font-semibold tracking-tight">予約設定</h1>
            <HelpPopover title="予約設定について">
              クリニックの予約運用を決める管理画面です。まず診療メニュー、次に担当医、最後に診療時間・受付期間を設定することで、予約カレンダーや患者向けWEB予約の基本条件を整えられます。
            </HelpPopover>
          </div>
          <p className="text-sm text-muted-foreground">
            医院ごとの予約ルールを設定します。受付スタッフや院長が運用変更時に使用する想定です。
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardContent className="flex gap-3 p-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Stethoscope className="size-4" />
            </span>
            <div>
              <div className="text-sm font-semibold">1. 診療メニューを決める</div>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                何を予約できるか、何分枠か、同時に何名受け付けるかを設定します。
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex gap-3 p-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <UserRoundCog className="size-4" />
            </span>
            <div>
              <div className="text-sm font-semibold">2. 担当医を登録する</div>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                予約を担当する医師を登録し、現在予約を受け付ける医師を管理します。
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex gap-3 p-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <CalendarClock className="size-4" />
            </span>
            <div>
              <div className="text-sm font-semibold">3. 診療日・受付期間を決める</div>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                診療時間、休診日、何日先まで予約を受け付けるかを設定します。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="menus" className="space-y-4">
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="menus">診療メニュー</TabsTrigger>
          <TabsTrigger value="doctors">担当医</TabsTrigger>
          <TabsTrigger value="schedule">診療日・受付期間</TabsTrigger>
        </TabsList>

        <TabsContent value="menus">
          <Card>
            <CardHeader className="space-y-3">
              <SettingHeader
                title="診療メニュー"
                description="患者が予約時に選択する診療内容と、予約枠の基本条件を設定します。"
                help={
                  <>
                    一般診察、胃カメラ、人間ドックなど、医院ごとに予約対象を登録します。所要時間と定員は空き枠の判定に利用する想定です。
                  </>
                }
              />
              <SettingImpact>
                患者向けWEB予約、予約カレンダー、新規予約、予約集計
              </SettingImpact>
            </CardHeader>

            <CardContent className="space-y-3">
              {types.map((type) => (
                <div key={type.id} className="rounded-xl border p-4">
                  <div className="grid gap-4 lg:grid-cols-[minmax(220px,1fr)_140px_140px_120px_100px] lg:items-end">
                    <div>
                      <Label htmlFor={`name-${type.id}`}>診療メニュー名</Label>
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
                        <Label htmlFor={`duration-${type.id}`}>所要時間</Label>
                        <HelpPopover title="所要時間">
                          このメニュー1件あたりに確保する標準時間です。例：胃カメラ30分、一般診察15分など。
                        </HelpPopover>
                      </div>
                      <div className="relative">
                        <Input
                          id={`duration-${type.id}`}
                          className="pr-10"
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
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          分
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1">
                        <Label htmlFor={`capacity-${type.id}`}>1枠の定員</Label>
                        <HelpPopover title="1枠の定員">
                          同じ予約時間に受け付けられる人数です。設備や医師の対応可能数に合わせて設定します。
                        </HelpPopover>
                      </div>
                      <div className="relative">
                        <Input
                          id={`capacity-${type.id}`}
                          className="pr-10"
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
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          名
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1">
                        <Label htmlFor={`color-${type.id}`}>表示色</Label>
                        <HelpPopover title="表示色">
                          予約カレンダーで診療メニューを識別するための色です。予約条件には影響しません。
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

                    <label className="flex items-center gap-2 pb-2 text-sm">
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
                      予約受付中
                    </label>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="doctors">
          <Card>
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <SettingHeader
                  title="担当医"
                  description="予約カレンダーや新規予約で選択する医師を管理します。"
                  help={
                    <>
                      医師名と役割を登録します。「予約受付中」をOFFにすると、新しい予約を受け付けない医師として扱う想定です。
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
              </div>

              <SettingImpact>
                予約カレンダー、新規予約、予約一覧の担当医表示
              </SettingImpact>
            </CardHeader>

            <CardContent className="space-y-3">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="grid gap-3 rounded-xl border p-4 sm:grid-cols-[minmax(200px,1fr)_180px_120px] sm:items-end"
                >
                  <div>
                    <Label htmlFor={`doctor-name-${doctor.id}`}>医師名</Label>
                    <Input
                      id={`doctor-name-${doctor.id}`}
                      value={doctor.name}
                      onChange={(event) =>
                        setDoctors((current) =>
                          current.map((item) =>
                            item.id === doctor.id ? { ...item, name: event.target.value } : item,
                          ),
                        )
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor={`doctor-role-${doctor.id}`}>役割</Label>
                    <Input
                      id={`doctor-role-${doctor.id}`}
                      value={doctor.role}
                      onChange={(event) =>
                        setDoctors((current) =>
                          current.map((item) =>
                            item.id === doctor.id ? { ...item, role: event.target.value } : item,
                          ),
                        )
                      }
                    />
                  </div>

                  <label className="flex items-center gap-2 pb-2 text-sm">
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
                    予約受付中
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader className="space-y-3">
              <SettingHeader
                title="診療日・受付期間"
                description="医院全体の基本診療時間、休診日、予約受付可能な期間を設定します。"
                help={
                  <>
                    この画面では医院全体の基本ルールを設定します。曜日ごとに異なる診療時間や臨時休診は、今後の拡張項目です。
                  </>
                }
              />
              <SettingImpact>
                患者向けWEB予約、空き枠判定、予約カレンダー
              </SettingImpact>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-3 text-sm font-semibold">基本診療時間</h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
              </div>

              <div className="border-t pt-5">
                <div className="mb-3 flex items-center gap-1">
                  <h3 className="text-sm font-semibold">休診日</h3>
                  <HelpPopover title="休診日">
                    通常予約を受け付けない曜日を設定します。チェックした曜日は休診日として扱う想定です。
                  </HelpPopover>
                </div>

                <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                  {WEEKDAYS.map((day, index) => {
                    const checked = schedule.closedDays.includes(index);
                    return (
                      <label
                        key={day}
                        className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm transition ${checked ? "border-primary bg-primary/5 font-medium" : "hover:bg-muted/50"}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) =>
                            setSchedule((current) => ({
                              ...current,
                              closedDays: event.target.checked
                                ? [...current.closedDays, index]
                                : current.closedDays.filter((value) => value !== index),
                            }))
                          }
                        />
                        {day}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="border-t pt-5">
                <div className="max-w-sm">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="booking-days">予約受付期間</Label>
                    <HelpPopover title="予約受付期間">
                      今日から何日先まで患者が予約できるかを設定します。例：30日にすると、30日先までを予約対象にする想定です。
                    </HelpPopover>
                  </div>

                  <div className="mt-1 flex items-center gap-2">
                    <Input
                      id="booking-days"
                      type="number"
                      min={1}
                      value={schedule.bookingDays}
                      onChange={(event) =>
                        setSchedule((current) => ({ ...current, bookingDays: Number(event.target.value) }))
                      }
                    />
                    <span className="shrink-0 text-sm text-muted-foreground">日先まで</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
