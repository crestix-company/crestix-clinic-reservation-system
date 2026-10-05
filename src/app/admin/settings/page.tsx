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
        <h1 className="text-2xl font-semibold tracking-tight">設定</h1>
        <p className="text-sm text-muted-foreground">クリニック情報と外部連携の状態を確認できます</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>クリニック情報</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <div className="space-y-0.5">
            <div className="text-xs text-muted-foreground">クリニック名</div>
            <div className="font-medium">{clinic.name}</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-xs text-muted-foreground">clinicId</div>
            <div className="font-mono">{serviceIdentity.clinicId}</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-xs text-muted-foreground">serviceId</div>
            <div className="font-mono">{serviceIdentity.serviceId}</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-xs text-muted-foreground">crmCustomerId</div>
            <div className="font-mono">{serviceIdentity.crmCustomerId}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>外部連携</CardTitle>
          <CardDescription>今回のデモでは実接続を行っていません。将来的に以下のサービスと連携予定です。</CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          {INTEGRATIONS.map((integration) => (
            <div key={integration.name} className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium">{integration.name}</div>
                <div className="text-sm text-muted-foreground">{integration.description}</div>
              </div>
              <Badge variant="outline" className="border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {integration.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
