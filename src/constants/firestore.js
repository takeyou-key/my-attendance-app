/**
 * Firestoreコレクション名定数
 * コレクション名を一元管理し、変更時の影響を最小化する
 * 
 * 主な機能:
 * - コレクション名の定数定義
 * - 変更時の一括更新対応
 * - 命名規則の統一
 */

// 勤怠関連
export const COLLECTIONS = {
  // 勤怠記録（旧: attendances）
  TIME_RECORDS: 'time_records',
  
  // 変更申請（旧: applications, requests）
  CHANGE_REQUESTS: 'change_requests',
  
  // ユーザー設定（旧: settings）
  USER_SETTINGS: 'user_settings',
  
  // ユーザープロフィール（旧: users）
  USER_PROFILES: 'user_profiles'
};

// ドキュメントID生成ヘルパー
export const generateDocId = {
  // 勤怠記録のドキュメントID生成
  timeRecord: (userId, date) => `${userId}_${date}`,
  
  // ユーザー設定のドキュメントID生成
  userSetting: (userId) => userId,
  
  // ユーザープロフィールのドキュメントID生成
  userProfile: (userId) => userId
}; 