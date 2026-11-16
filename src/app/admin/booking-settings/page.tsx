"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Plus, Stethoscope, UserRoundCog } from "lucide-react";
import { useDemoStore } from "@/components/admin/demo-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RoleGuard } from "@/components/admin/role-guard";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export default function BookingSettingsPage() {
  const { doctors, types, schedule, setDoctors, setTypes, setSchedule } = useDemoStore();
  const [selectedTypeId, setSelectedTypeId] = useState(types[0]?.id ?? "");
  const [newMenuName, setNewMenuName] = useState("");
  const [exceptionDate, setExceptionDate] = useState("");
  const [exceptionTypeId, setExceptionTypeId] = useState(types[0]?.id ?? "");
  const [exceptionReason, setExceptionReason] = useState("");

  const selectedType = useMemo(
    () => types.find((type) => type.id === selectedTypeId) ?? types[0],
    [types, selectedTypeId],
  );

  function addMenu() {
    const name = newMenuName.trim();
    if (!name) return;
    const id = `rt-custom-${Date.now()}`;
    const next = {
      id,
      clinicId: types[0]?.clinicId ?? "clinic-kawaratani",
      code: `CUSTOM_${Date.now()}`,
      name,
      active: true,
      color: "#64748b",
      durationMinutes: 30,
      capacity: 1,
      maxConcurrent: 1,
      dailyLimit: 20,
    };
    setTypes((current) => [...current, next]);
    setSelectedTypeId(id);
    setNewMenuName("");
  }

  function updateSelected(changes: Record<string, unknown>) {
    if (!selectedType) return;
    setTypes((current) => current.map((type) => type.id === selectedType.id ? { ...type, ...changes } : type));
  }

  function addException() {
    if (!exceptionDate || !exceptionTypeId) return;
    setSchedule((current) => ({
      ...current,
      exceptions: [
        ...current.exceptions,
        {
          id: `ex-${Date.now()}`,
          date: exceptionDate,
          reservationTypeId: exceptionTypeId,
          reason: exceptionReason.trim() || undefined,
        },
      ],
    }));
    setExceptionDate("");
    setExceptionReason("");
  }

  return (
    <RoleGuard allowed={["DEVELOPER", "DIRECTOR"]}>
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">予約設定</h1>
        <p className="text-sm text-muted-foreground">診療メニュー・担当医・診療日・予約上限を設定します。</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Summary icon={Stethoscope} title="診療メニュー" text="所要時間、同時予約数、1日の受付上限を設定" />
        <Summary icon={UserRoundCog} title="担当医" text="予約を担当する医師を管理" />
        <Summary icon={CalendarClock} title="診療日・受付期間" text="診療時間、休診日、例外日を管理" />
      </div>

      <Tabs defaultValue="menus" className="space-y-4">
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="menus">診療メニュー</TabsTrigger>
          <TabsTrigger value="doctors">担当医</TabsTrigger>
          <TabsTrigger value="schedule">診療日・受付期間</TabsTrigger>
        </TabsList>

        <TabsContent value="menus">
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">診療メニューマスタ</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Input className="max-w-sm" value={newMenuName} onChange={(e) => setNewMenuName(e.target.value)} placeholder="追加する診療メニュー名" />
                  <Button variant="outline" onClick={addMenu}><Plus className="size-4" />診療メニューを追加</Button>
                </div>
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  {types.map((type) => <span key={type.id} className="rounded-full border px-3 py-1">{type.name}</span>)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">予約ルール</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <div className="max-w-sm space-y-1.5">
                  <Label>診療メニュー</Label>
                  <Select value={selectedType?.id ?? ""} onValueChange={(value) => value && setSelectedTypeId(value)}>
                    <SelectTrigger><SelectValue>{(value: string) => types.find((type) => type.id === value)?.name ?? "選択"}</SelectValue></SelectTrigger>
                    <SelectContent>{types.map((type) => <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">自由入力ではなく、診療メニューマスタから選択します。</p>
                </div>

                {selectedType && (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <NumberField label="所要時間（分）" value={selectedType.durationMinutes ?? 30} min={5} step={5} onChange={(value) => updateSelected({ durationMinutes: value })} />
                    <NumberField label="1枠の定員（名）" value={selectedType.capacity ?? 1} min={1} onChange={(value) => updateSelected({ capacity: value })} />
                    <NumberField label="同時予約許容数（件）" value={selectedType.maxConcurrent ?? selectedType.capacity ?? 1} min={1} onChange={(value) => updateSelected({ maxConcurrent: value })} />
                    <NumberField label="1日受付上限（件）" value={selectedType.dailyLimit ?? 20} min={1} onChange={(value) => updateSelected({ dailyLimit: value })} />
                  </div>
                )}

                <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                  メニュー自体を長期停止する場合のみマスタ状態を変更し、特定日だけ停止する場合は「診療日・受付期間」タブの例外日設定を使用します。
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="doctors">
          <Card>
            <CardHeader><div className="flex items-center justify-between"><CardTitle className="text-base">担当医</CardTitle><Button size="sm" variant="outline" onClick={() => setDoctors((current) => [...current, { id: `dr-demo-${Date.now()}`, clinicId: current[0]?.clinicId ?? "clinic-kawaratani", name: "新しい医師", role: "担当医", active: true }])}><Plus className="size-4" />医師を追加</Button></div></CardHeader>
            <CardContent className="space-y-3">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="grid gap-3 rounded-xl border p-4 sm:grid-cols-[minmax(200px,1fr)_180px_120px] sm:items-end">
                  <div><Label>医師名</Label><Input value={doctor.name} onChange={(e) => setDoctors((current) => current.map((item) => item.id === doctor.id ? { ...item, name: e.target.value } : item))} /></div>
                  <div><Label>役割</Label><Input value={doctor.role} onChange={(e) => setDoctors((current) => current.map((item) => item.id === doctor.id ? { ...item, role: e.target.value } : item))} /></div>
                  <label className="flex items-center gap-2 pb-2 text-sm"><input type="checkbox" checked={doctor.active} onChange={(e) => setDoctors((current) => current.map((item) => item.id === doctor.id ? { ...item, active: e.target.checked } : item))} />予約受付中</label>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader><CardTitle className="text-base">診療日・受付期間</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-3 text-sm font-semibold">基本診療時間</h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {(["morningStart", "morningEnd", "afternoonStart", "afternoonEnd"] as const).map((key, index) => (
                    <div key={key}><Label>{["午前 開始", "午前 終了", "午後 開始", "午後 終了"][index]}</Label><Input type="time" value={schedule[key]} onChange={(e) => setSchedule((current) => ({ ...current, [key]: e.target.value }))} /></div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-5">
                <h3 className="mb-3 text-sm font-semibold">休診日</h3>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                  {WEEKDAYS.map((day, index) => {
                    const checked = schedule.closedDays.includes(index);
                    return <label key={day} className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm ${checked ? "border-primary bg-primary/5 font-medium" : ""}`}><input type="checkbox" checked={checked} onChange={(e) => setSchedule((current) => ({ ...current, closedDays: e.target.checked ? [...current.closedDays, index] : current.closedDays.filter((value) => value !== index) }))} />{day}</label>;
                  })}
                </div>
              </div>

              <div className="border-t pt-5">
                <div className="max-w-sm"><Label>予約受付期間</Label><div className="mt-1 flex items-center gap-2"><Input type="number" min={1} value={schedule.bookingDays} onChange={(e) => setSchedule((current) => ({ ...current, bookingDays: Number(e.target.value) }))} /><span className="shrink-0 text-sm text-muted-foreground">日先まで</span></div></div>
              </div>

              <div className="border-t pt-5">
                <h3 className="mb-2 text-sm font-semibold">例外日・予約停止</h3>
                <p className="mb-3 text-xs text-muted-foreground">特定日だけ予約受付を停止します。他の日付には影響しません。</p>
                <div className="grid gap-2 md:grid-cols-[180px_220px_minmax(220px,1fr)_120px]">
                  <Input type="date" value={exceptionDate} onChange={(e) => setExceptionDate(e.target.value)} />
                  <Select value={exceptionTypeId} onValueChange={(value) => value && setExceptionTypeId(value)}><SelectTrigger><SelectValue>{(value: string) => types.find((type) => type.id === value)?.name ?? "診療メニュー"}</SelectValue></SelectTrigger><SelectContent>{types.map((type) => <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>)}</SelectContent></Select>
                  <Input value={exceptionReason} onChange={(e) => setExceptionReason(e.target.value)} placeholder="停止理由（任意）" />
                  <Button onClick={addException}>追加</Button>
                </div>
                <div className="mt-3 space-y-2">
                  {schedule.exceptions.length === 0 ? <p className="text-sm text-muted-foreground">例外日はありません。</p> : schedule.exceptions.map((exception) => (
                    <div key={exception.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm">
                      <span>{exception.date} ／ {types.find((type) => type.id === exception.reservationTypeId)?.name ?? "診療メニュー"} ／ 終日停止 {exception.reason ? `／ ${exception.reason}` : ""}</span>
                      <Button size="sm" variant="ghost" onClick={() => setSchedule((current) => ({ ...current, exceptions: current.exceptions.filter((item) => item.id !== exception.id) }))}>削除</Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </RoleGuard>
  );
}

function Summary({ icon: Icon, title, text }: { icon: typeof Stethoscope; title: string; text: string }) {
  return <Card><CardContent className="flex gap-3 p-4"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted"><Icon className="size-4" /></span><div><div className="text-sm font-semibold">{title}</div><p className="mt-1 text-xs leading-5 text-muted-foreground">{text}</p></div></CardContent></Card>;
}

function NumberField({ label, value, min, step, onChange }: { label: string; value: number; min: number; step?: number; onChange: (value: number) => void }) {
  return <div><Label>{label}</Label><Input type="number" min={min} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} /></div>;
}
