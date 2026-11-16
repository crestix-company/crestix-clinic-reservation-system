import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { clinics, serviceIdentity } from "@/data/mock/clinics";

const INTEGRATIONS = [
  { name: "Supabase", description: "予約・患者データの本番データベース", status: "未接続" },
  { name: "Crestix CRM", description: "サービス稼働状況・障害情報の連携", status: "未接続" },
  { name: "LINE公式アカウント", description: "LINEからの予約・通知連携", status: "未接続" },
  { name: "電子カルテ", description: "電子カルテ側の予約・受診情報の同期", status: "未接続" },
  { name: "サービス監視", description: "稼働監視・障害検知レポート", status: "未接続" },
];

export default function SettingsPage() {
  const clinic = clinics[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">システム設定</h1>
        <p className="text-sm text-muted-foreground">開発者向けのシステム情報・外部連携状態を確認します。</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>クリニック情報</CardTitle>
          <CardDescription>通常利用者に公開して問題ない情報のみを表示します。</CardDescription>
        </CardHeader>
        <CardContent className="text-sm">
          <div className="space-y-0.5">
            <div className="text-xs text-muted-foreground">クリニック名</div>
            <div className="font-medium">{clinic.name}</div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-violet-200 bg-violet-50/30">
        <CardHeader>
          <CardTitle>開発者情報</CardTitle>
          <CardDescription>院長・受付担当には表示しない開発・運用向け情報です。認証導入後は開発者ロールのみに制限します。</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
          <div><div className="text-xs text-muted-foreground">clinicId</div><div className="font-mono">{serviceIdentity.clinicId}</div></div>
          <div><div className="text-xs text-muted-foreground">serviceId</div><div className="font-mono">{serviceIdentity.serviceId}</div></div>
          <div><div className="text-xs text-muted-foreground">crmCustomerId</div><div className="font-mono">{serviceIdentity.crmCustomerId}</div></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>外部連携（開発者専用）</CardTitle>
          <CardDescription>デモでは実接続していません。本番認証導入後、開発者ロール以外には非表示にします。</CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          {INTEGRATIONS.map((integration) => (
            <div key={integration.name} className="flex items-center justify-between py-3">
              <div><div className="font-medium">{integration.name}</div><div className="text-sm text-muted-foreground">{integration.description}</div></div>
              <Badge variant="outline" className="border-slate-200 bg-slate-100 text-slate-600">{integration.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ロール設計</CardTitle>
          <CardDescription>ログイン実装時に以下の閲覧範囲で制御します。</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="py-2">画面</th><th>受付担当</th><th>院長</th><th>開発者</th></tr></thead>
            <tbody>
              {[
                ["本日の予約・受付", "○", "○", "○"],
                ["予約カレンダー", "○", "○", "○"],
                ["患者・予約管理", "○", "○", "○"],
                ["予約設定", "△", "○", "○"],
                ["予約集計", "△", "○", "○"],
                ["システム設定", "×", "×", "○"],
              ].map((row) => <tr key={row[0]} className="border-b last:border-0">{row.map((cell, index) => <td key={index} className="py-2">{cell}</td>)}</tr>)}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
