"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listPatients, getPatientReservationCount } from "@/lib/services/patient-service";

export default function PatientsPage() {
  const patients = useMemo(() => listPatients(), []);
  const [keyword, setKeyword] = useState("");

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return patients;
    return patients.filter(
      (p) => p.name.toLowerCase().includes(kw) || p.kana.toLowerCase().includes(kw) || p.phone.includes(kw),
    );
  }, [patients, keyword]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">患者</h1>
        <p className="text-sm text-muted-foreground">登録患者の一覧です（デモ用の架空データです）</p>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="氏名・フリガナ・電話番号で検索" className="pl-9" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>患者ID</TableHead>
                  <TableHead>氏名</TableHead>
                  <TableHead>フリガナ</TableHead>
                  <TableHead>電話番号</TableHead>
                  <TableHead>生年月日</TableHead>
                  <TableHead className="text-right">予約件数</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice(0, 50).map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-sm text-muted-foreground">{p.id}</TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.kana}</TableCell>
                    <TableCell>{p.phone}</TableCell>
                    <TableCell>{p.birthDate}</TableCell>
                    <TableCell className="text-right tabular-nums">{getPatientReservationCount(p.id)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
