# 勤怠管理アプリ (Attendance Management App)

React + Vite + Firebase を使用した勤怠管理システムです。出勤・退勤の打刻機能、履歴表示機能、申請機能を提供します。

## UI/UX デザイン

### 色分けシステム
- **ユーザー画面**: 紫（インディゴ `#4f46e5`）- 一般ユーザー向け
- **管理者画面**: 緑（エメラルド `#059669`）- 管理者向け

### 統一されたデザイン
- レスポンシブデザイン（モバイル・タブレット・デスクトップ対応）
- 統一されたヘッダーコンポーネント（高さ116px固定）
- モダンなUI（Tailwind CSS使用）
- カスタマイズ可能なボタン・ヘッダーコンポーネント

## 機能

### 認証機能
- ユーザー登録・ログイン機能
- 管理者ログイン機能
- Firebase Authentication を使用
- セッションタイムアウト機能（30分無操作で自動ログアウト）

### 勤怠管理
- **出勤打刻**: 現在時刻で出勤を記録
- **退勤打刻**: 現在時刻で退勤を記録
- **リアルタイム表示**: 現在時刻をリアルタイムで表示
- **今日の状況**: 本日の出勤・退勤時刻を表示
- **勤務時間計算**: 自動で勤務時間、残業時間を計算

### 履歴・申請機能
- 過去の勤怠記録を一覧表示
- 勤怠修正申請機能
- 申請一覧表示（申請中・対応済み）
- 申請状況の色分け表示
- コメント付き申請機能

### 管理者機能
- 全ユーザーの申請一覧表示
- 申請の承認・否認機能
- 一括承認機能
- 申請詳細表示
- 勤怠データの自動更新

### UI/UX
- レスポンシブデザイン（モバイル・タブレット・デスクトップ対応）
- モダンなUI（Tailwind CSS使用）
- 統一されたヘッダーコンポーネント（高さ116px固定）
- 現在のページを示すcurrent状態表示
- ソート・検索・フィルター機能
- タブナビゲーション
- モーダルダイアログ
- モバイル用下部固定ナビゲーション
- デスクトップ用サイドメニュー

## 技術スタック

- **フロントエンド**: React 18 + Vite 4.5.2
- **スタイリング**: Tailwind CSS + PostCSS
- **バックエンド**: Firebase
  - Authentication (認証)
  - Firestore (データベース)
- **ルーティング**: React Router v6
- **状態管理**: React Hooks
- **カスタムフック**: useAuth, useClock, useSessionTimeout
- **デプロイ**: Vercel
- **パッケージマネージャー**: npm

## プロジェクト構造

```
src/
├── components/          # 再利用可能なコンポーネント
│   ├── Button.jsx      # 統一されたボタンコンポーネント（bgColor, textColor対応）
│   ├── Header.jsx      # ヘッダーコンポーネント（bgColor, textColor対応）
│   ├── Layout.jsx      # レイアウトコンポーネント（current状態表示対応）
│   ├── AdminLayout.jsx # 管理者用レイアウト（緑色テーマ）
│   ├── Modal.jsx       # モーダルダイアログ
│   ├── LoadingSpinner.jsx # ローディングスピナー
│   ├── TabNavigation.jsx # タブナビゲーション
│   ├── SearchFilterTable.jsx # 検索・フィルター機能付きテーブル
│   ├── FormInput.jsx   # フォーム入力コンポーネント
│   └── AuthGuard.jsx   # 認証ガード
├── pages/              # ページコンポーネント
│   ├── Login.jsx       # ユーザーログインページ（紫テーマ）
│   ├── AdminLogin.jsx  # 管理者ログインページ（緑テーマ）
│   ├── Register.jsx    # ユーザー登録ページ
│   ├── ResetPassword.jsx # パスワードリセット
│   ├── Home.jsx        # メインページ（打刻機能）
│   ├── Clock.jsx       # 打刻ページ
│   ├── History.jsx     # 履歴・申請ページ
│   ├── RequestList.jsx # 申請一覧ページ
│   ├── AdminHome.jsx   # 管理者ホームページ（緑テーマ）
│   └── Settings.jsx    # 設定ページ
├── hooks/              # カスタムフック
│   ├── useAuth.js      # 認証フック
│   ├── useClock.js     # 時計フック
│   └── useSessionTimeout.js # セッションタイムアウト
├── utils/              # ユーティリティ関数
│   ├── timeCalculations.js # 時間計算
│   ├── attendanceUtils.js  # 勤怠データ取得
│   └── auth.js         # 認証ユーティリティ
├── constants/          # 定数
│   └── firestore.js    # Firestore定数
├── firebase.js         # Firebase設定
└── App.jsx             # メインアプリケーション
```

## セットアップ

### 前提条件
- Node.js (v20以上推奨)
- npm

### インストール
```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview
```

### デプロイ
```bash
# Vercelへのデプロイ（自動）
git push origin main
```

### Firebase設定
1. Firebase プロジェクトを作成
2. Authentication を有効化（メール/パスワード認証）
3. Firestore データベースを作成
4. `src/firebase.js` に設定情報を追加

### 設定ファイル
- `vite.config.js` - Vite設定（Vite 4.5.2対応）
- `vercel.json` - Vercelデプロイ設定
- `postcss.config.js` - PostCSS設定（ESM形式）
- `tailwind.config.js` - Tailwind CSS設定

## データ構造

### Firestore コレクション: `time_records`
```javascript
{
  userId: "user123",
  date: "2024-01-15",
  clockIn: "09:00",
  clockOut: "18:00",
  breakTime: "01:00",
  workTime: "08:00",
  actualWorkTime: "07:00",
  overTime: "01:00",
  status: "承認済み"
}
```

### Firestore コレクション: `change_requests`
```javascript
{
  item: "勤怠修正申請",
  date: "7月31日",
  applicant: "ユーザー名",
  targetDate: "7月25日",
  status: "未対応",
  userId: "user123",
  attendanceDate: "2024-07-25",
  comment: "申請コメント",
  originalData: { clockIn: "09:00", clockOut: "18:00", breakTime: "01:00" },
  updatedData: { clockIn: "08:30", clockOut: "17:30", breakTime: "01:00" }
}
```

### Firestore コレクション: `user_settings`
```javascript
{
  userId: "user123",
  regularWorkHours: 8,        // 定時時間（時間）
  workDaysPerMonth: 22,       // 月間勤務日数
  breakTime: "01:00",         // 休憩時間
  createdAt: "2024-01-01",    // 作成日
  updatedAt: "2024-01-15"     // 更新日
}
```

### Firestore コレクション: `users`
```javascript
{
  userId: "user123",
  email: "user@example.com",
  role: "user",               // "user" | "admin"
  createdAt: "2024-01-01",    // 作成日
  lastLoginAt: "2024-01-15"   // 最終ログイン日
}
```

## 主要機能の実装詳細

### 認証システム
- ユーザーと管理者の分離ログイン
- セッション管理（同時ログイン防止）
- 認証ガードによる保護
- 現在のページを示すcurrent状態表示

### 打刻機能
- 現在時刻を取得してFirestoreに保存
- 勤務時間の自動計算
- 残業時間の自動計算

### 申請システム
- 勤怠修正申請の作成
- 申請状況の管理
- 承認・否認による勤怠データの自動更新
- 申請前後のデータ比較表示

### 管理者機能
- 全申請の一覧表示
- ソート・検索・フィルター機能
- 一括承認機能
- 申請詳細の表示

### セッションタイムアウト
- 30分間無操作で自動ログアウト
- アクティビティ監視（マウス、キーボード、タッチ）
- 手動セッション延長機能

## 実装済み機能
- [x] ユーザー認証の実装
- [x] 勤務時間の自動計算
- [x] 申請機能
- [x] 管理者機能
- [x] セッションタイムアウト
- [x] UI/UXデザインの統一（色分けシステム）
- [x] Vercelデプロイ対応
- [x] Service Workerエラーハンドリング
- [x] 現在のページを示すcurrent状態表示
- [x] モバイル用下部固定ナビゲーション
- [x] デスクトップ用サイドメニュー
- [x] レスポンシブレイアウト（モバイル・タブレット・デスクトップ対応）

## 今後の拡張予定
- [ ] 有給休暇申請機能
- [ ] 残業申請機能

## ライセンス
MIT License


