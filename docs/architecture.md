# アーキテクチャ概要

このドキュメントは、クリニック向け予約一元管理システムの **UIデモ** としての実装範囲と、
将来の本実装に向けた拡張方針をまとめたものです。

## 1. 今回のデモ範囲

- Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Recharts + date-fns によるフロントエンドのみの実装
- すべてのデータは `src/data/mock/` 配下の架空データ（患者名・電話番号・生年月日等はすべて架空）
- 状態変更（予約詳細の受付/キャンセル、当日受付の呼出/診察開始/完了、Web予約フォームの入力）は
  すべてブラウザ内のReact state（フロント側）のみで完結し、サーバーやDBへの書き込みは行わない
- 以下は **実接続していない**：Supabase、Crestix CRM本番、LINE API、Google API、電子カルテAPI、
  AI電話、決済、外部SaaS、本番認証

## 2. レイヤー構成

```
src/
  types/domain.ts          # Clinic / Patient / Reservation / Reception 等のドメイン型
  data/mock/                # モックデータ（将来はAPI/DBクライアントに置き換え）
  lib/services/             # データ取得・集計ロジック（UIはこの層だけに依存する）
  components/                # 再利用可能なUIコンポーネント
  app/                       # ルーティング（/admin, /reserve, /display 等）
  integrations/crm/          # Crestix CRM 連携のインターフェースとMock実装
  monitoring/                 # サービス監視の型と最小実装
```

UIコンポーネントは `src/lib/services/*` が公開する関数（`listReservations`,
`getDashboardKpis`, `listTodayReceptionQueue` など）だけを呼び出します。
これらの関数の実装を将来Supabase/REST APIへの問い合わせに差し替えれば、
呼び出し側のコンポーネントは変更不要です。

## 3. 将来のSupabase接続

- `src/data/mock/*.ts` の各配列（`reservations`, `patients`, `receptions` 等）を、
  Supabaseクライアントによるクエリ結果に置き換える想定
- `src/types/domain.ts` の型がそのままテーブルスキーマの基礎になる
- 予約作成・状態変更（`ReservationDetailDialog` の各アクション、`ReceptionQueue` の呼出/診察開始/完了）は
  現在フロントのみのstate更新だが、将来はSupabaseへの更新 → Realtimeでの反映に置き換える

## 4. Crestix CRM連携

Crestix CRMは「どの顧客（クリニック）にどのCrestixサービスを提供しているか」を管理するシステムです。
本予約システムはその一つのサービスとして、稼働状況や障害情報をCRM側へ報告する想定です。

- `src/integrations/crm/types.ts`: `CrmServiceAdapter` インターフェースと識別子の型
- `src/integrations/crm/mock-crm-adapter.ts`: 今回利用する、コンソール出力のみを行うNo-op実装
- `clinicId` / `serviceId` / `crmCustomerId`（`src/data/mock/clinics.ts` の `serviceIdentity`）が
  CRM側の顧客レコードとこのサービスインスタンスを結びつけるキーになる
- UIコンポーネントからこのアダプターを直接呼び出すことはない（データ層/将来のサーバー側処理からのみ利用）

## 5. Monitoring（サービス監視）

- `src/monitoring/types.ts`: `ServiceStatus` (`HEALTHY` / `DEGRADED` / `DOWN`)、
  `ServiceHealthReport`、`ServiceIncident`、`IncidentSeverity` を定義
- `src/monitoring/health.ts` / `incident.ts`: 現時点ではレポートを組み立てるだけのヘルパー
- `/api/health` がこのサービスの最小のヘルスチェックエンドポイント
- 将来検知したい障害（`KNOWN_INCIDENT_TYPES`、`src/monitoring/types.ts` 内にコメントで記載）：
  - Reservation API error
  - DB connection error
  - LINE integration error
  - EHR integration error
  - display update failure
  - repeated reservation creation failure
  - authentication failure spike

今回はこれらの検知ロジック自体は実装していません。

## 6. LINE連携（将来）

- 現在、予約経路 (`ReservationSource`) として `LINE` を型として持ち、UI上でもBadgeとして表示している
- 将来的にはLINE Messaging APIのWebhookを受け、予約作成・リマインド通知等を行う想定
- `PHONE`（AI電話想定）も型としては用意済みだが、今回はUI上に強く出していない

## 7. 電子カルテ連携（将来）

- `ReservationSource.EHR` として型を用意
- 将来、電子カルテ側で登録された予約をこのシステムに同期する想定（方向はEHR → 本システムを想定）

## 8. Source of Truth（データの正本）

今回のデモでは `src/data/mock/*.ts` が正本です。本実装移行時は、
Supabase（またはその他のRDB）をSource of Truthとし、以下のような移行ステップを想定しています。

1. `src/types/domain.ts` の型を元にテーブルスキーマを設計
2. `src/lib/services/*` の各関数の内部実装をDBクエリに置き換え（関数シグネチャは維持）
3. 予約・受付の状態変更をフロントstateからサーバーミューテーションに置き換え
4. CRM/監視レイヤーの実装を `mock-crm-adapter.ts` から実アダプターに置き換え
