# クリニック向け予約一元管理システム（UIデモ）

瓦谷クリニックの予約導線（当日診察・胃カメラ・大腸関連・人間ドック・LINE・Web・院内受付・電子カルテ経由）を
1つの予約管理システムに集約するイメージを確認していただくための **UI/UXデモ** です。

> **本リポジトリはUIデモです。** Supabase・Crestix CRM本番・LINE API・Google API・電子カルテAPI・
> AI電話・決済・外部SaaS・本番認証への実接続は一切行っていません。
> 患者名・電話番号・生年月日などのデータはすべて架空のモックデータです。

詳しい設計方針は [`docs/architecture.md`](./docs/architecture.md)、
デモの見せ方は [`docs/demo-scenario.md`](./docs/demo-scenario.md) を参照してください。

## 技術スタック

- Next.js (App Router) / TypeScript
- Tailwind CSS / shadcn/ui / lucide-react
- Recharts / date-fns

## Setup

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開くと画面一覧（トップページ）が表示されます。

### Build

```bash
npm run build
npm run start
```

### Lint

```bash
npm run lint
```

## 主なURL

| URL | 画面 |
| --- | --- |
| `/` | デモ画面一覧（トップ） |
| `/admin` | 予約管理ダッシュボード |
| `/admin/reservations` | 予約一覧（検索・絞り込み・ページネーション） |
| `/admin/calendar` | 予約カレンダー（日表示・週表示） |
| `/admin/reception` | 当日受付管理 |
| `/admin/patients` | 患者一覧 |
| `/admin/analytics` | 集計（予約内容 × 予約経路 など） |
| `/admin/settings` | 設定（クリニック情報・外部連携状況） |
| `/reserve` | 患者向けWeb予約（スマートフォン優先） |
| `/display` | 院内モニター（待合室フルスクリーン表示） |
| `/api/health` | ヘルスチェックエンドポイント |

## データ構成

すべてのデータは `src/data/mock/` 配下の架空データで、`src/lib/services/` を経由してUIに渡されます。
将来的にSupabase等の実データソースへ差し替える場合も、`src/lib/services/` の関数シグネチャを
変えずに内部実装のみ置き換えることでUIコンポーネント側は無修正で移行できる構造にしています。

予約の状態変更（受付する／キャンセル、当日受付の呼出／診察開始／完了、Web予約の送信）は
すべてブラウザ内のReact stateのみで動作し、リロードすると初期状態に戻ります。

## 今後の拡張予定

- Supabase（またはPostgres）への実データ移行
- Crestix CRMとのサービス稼働状況連携（`src/integrations/crm/`）
- サービス監視・障害検知（`src/monitoring/`）
- LINE公式アカウント・電子カルテとの実連携
- 本番認証・RLSの導入
