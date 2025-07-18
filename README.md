# 勤怠管理アプリ (Attendance Management App)

React + Vite + Firebase を使用した勤怠管理システムです。出勤・退勤の打刻機能と履歴表示機能を提供します。

## 🚀 機能

### 認証機能
- ユーザー登録・ログイン機能
- Firebase Authentication を使用

### 勤怠管理
- **出勤打刻**: 現在時刻で出勤を記録
- **退勤打刻**: 現在時刻で退勤を記録
- **リアルタイム表示**: 現在時刻をリアルタイムで表示
- **今日の状況**: 本日の出勤・退勤時刻を表示

### 履歴機能
- 過去の勤怠記録を一覧表示
- Firestore からデータを取得・表示

### UI/UX
- レスポンシブデザイン
- モダンなUI（Tailwind CSS使用）
- 左側固定メニュー
- 統一されたヘッダーコンポーネント

## 🛠️ 技術スタック

- **フロントエンド**: React 18 + Vite
- **スタイリング**: Tailwind CSS
- **バックエンド**: Firebase
  - Authentication (認証)
  - Firestore (データベース)
- **ルーティング**: React Router v6
- **状態管理**: React Hooks

## 📁 プロジェクト構造

```
src/
├── components/          # 再利用可能なコンポーネント
│   ├── Button.jsx      # 統一されたボタンコンポーネント
│   └── Header.jsx      # ヘッダーコンポーネント（ナビゲーション付き）
├── pages/              # ページコンポーネント
│   ├── Login.jsx       # ログインページ
│   ├── Register.jsx    # ユーザー登録ページ
│   ├── Home.jsx        # メインページ（打刻機能）
│   ├── History.jsx     # 履歴表示ページ
│   └── CompleteMessage.jsx # 打刻完了メッセージ（統合版）
├── firebase.js         # Firebase設定
└── App.jsx             # メインアプリケーション
```

## 🔧 セットアップ

### 前提条件
- Node.js (v16以上)
- npm または yarn

### インストール
```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

### Firebase設定
1. Firebase プロジェクトを作成
2. Authentication を有効化
3. Firestore データベースを作成
4. `src/firebase.js` に設定情報を追加

## 📊 データ構造

### Firestore コレクション: `attendance`
```javascript
{
  userId: "sampleUser",
  date: "2024-01-15",
  clockIn: "09:00:00",
  clockOut: "18:00:00"
}
```

## 🎯 主要機能の実装詳細

### 打刻機能
- 現在時刻を取得してFirestoreに保存
- 重複打刻防止（現在は無効化済み）
- 完了メッセージの表示

### 統合されたCompleteMessageコンポーネント
- URLパラメータで出勤/退勤を判別
- 動的なメッセージ表示
- 3秒後に自動的にホーム画面に戻る

### レスポンシブレイアウト
- 左側固定メニュー
- 右側コンテンツエリア
- モバイル対応

## 🚀 今後の拡張予定

- [ ] ユーザー認証の実装
- [ ] 勤務時間の自動計算
- [ ] 月次レポート機能
- [ ] 管理機能

## 📝 ライセンス


