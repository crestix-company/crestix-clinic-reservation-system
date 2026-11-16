"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Database, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PHONE_PATTERN = /^(?:0\d{1,4}-?\d{1,4}-?\d{3,4})$/;

export default function NewPatientPage() {
  const [name, setName] = useState("");
  const [kana, setKana] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [prepared, setPrepared] = useState(false);

  const valid = useMemo(
    () => name.trim().length >= 2 && kana.trim().length >= 2 && PHONE_PATTERN.test(phone.trim()) && !!birthDate,
    [name, kana, phone, birthDate],
  );

  return (
    <div className="space-y-5">
      <div>
        <Link href="/admin/reservations" className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" />患者・予約管理へ戻る
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">初診患者を作成</h1>
        <p className="text-sm text-muted-foreground">
          Crestix側の患者情報を作成し、電子カルテ側の新規患者登録へつなぐための画面です。
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>患者基本情報</CardTitle>
          <CardDescription>電子カルテ連携に必要となる基本項目を先に入力します。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="氏名" required><Input value={name} onChange={(e) => { setName(e.target.value); setPrepared(false); }} placeholder="例：山田 太郎" /></Field>
          <Field label="フリガナ" required><Input value={kana} onChange={(e) => { setKana(e.target.value); setPrepared(false); }} placeholder="例：ヤマダ タロウ" /></Field>
          <Field label="電話番号" required>
            <Input value={phone} onChange={(e) => { setPhone(e.target.value); setPrepared(false); }} placeholder="例：090-1234-5678" />
            {phone && <p className={`mt-1 text-xs ${PHONE_PATTERN.test(phone.trim()) ? "text-emerald-700" : "text-destructive"}`}>{PHONE_PATTERN.test(phone.trim()) ? "電話番号形式OK" : "10〜11桁の国内電話番号を入力してください"}</p>}
          </Field>
          <Field label="生年月日" required><Input type="date" value={birthDate} onChange={(e) => { setBirthDate(e.target.value); setPrepared(false); }} /></Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>初診登録フロー</CardTitle>
          <CardDescription>電子カルテ連携部分は宅保さんへの要件確認後に本実装します。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <Step number="1" title="患者情報入力" text="氏名・フリガナ・電話番号・生年月日を入力" active />
          <Step number="2" title="重複患者確認" text="Patient ID・氏名・生年月日等で既存患者を確認" active={prepared} />
          <Step number="3" title="EHR新規登録" text="電子カルテ側に患者を新規登録" pending />
          <Step number="4" title="ID紐付け" text="取得した診察券番号/EHR患者番号をPatient IDへ紐付け" pending />
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" asChild><Link href="/admin/reservations">キャンセル</Link></Button>
        <Button disabled={!valid} onClick={() => setPrepared(true)}><UserPlus className="size-4" />入力内容を確認</Button>
      </div>

      {prepared && (
        <Card className="border-emerald-200 bg-emerald-50/40">
          <CardContent className="space-y-3 pt-5">
            <div className="flex items-center gap-2 font-semibold text-emerald-900"><CheckCircle2 className="size-5" />Crestix患者情報の入力確認が完了しました</div>
            <p className="text-sm text-emerald-900">次工程は電子カルテ側の新規登録です。連携方式・必須項目・患者番号の返却方法を宅保さんへ確認後に有効化します。</p>
            <Button disabled><Database className="size-4" />電子カルテへ新規登録（要件確認後に有効化）</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}{required ? <span className="text-destructive"> *</span> : null}</Label>{children}</div>;
}

function Step({ number, title, text, active, pending }: { number: string; title: string; text: string; active?: boolean; pending?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${active ? "border-primary/30 bg-primary/5" : pending ? "border-dashed bg-muted/30" : ""}`}>
      <div className="mb-2 flex items-center gap-2"><span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-semibold">{number}</span><span className="text-sm font-semibold">{title}</span></div>
      <p className="text-xs leading-5 text-muted-foreground">{text}</p>
      {pending ? <p className="mt-2 text-[11px] font-medium text-amber-700">宅保さん確認後</p> : null}
    </div>
  );
}
