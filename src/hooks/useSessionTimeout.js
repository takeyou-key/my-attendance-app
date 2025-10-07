/**
 * セッションタイムアウト機能を提供するカスタムフック
 * 一定時間無操作で自動ログアウトする機能を実装
 */
import { useEffect, useRef } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase.js';

/**
 * セッションタイムアウト機能
 * @param {number} timeoutMinutes - タイムアウト時間（分）
 * @param {boolean} enabled - タイムアウト機能を有効にするかどうか
 */
export const useSessionTimeout = (timeoutMinutes = 30, enabled = true) => {
  const timeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  // アクティビティを記録する関数
  const resetTimer = () => {
    lastActivityRef.current = Date.now();
  };

  // タイマーを開始する関数
  const startTimer = () => {
    if (!enabled) return;

    // 既存のタイマーをクリア
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 新しいタイマーを設定
    timeoutRef.current = setTimeout(async () => {
      try {
        console.log('セッションタイムアウト: 自動ログアウトします');
        // チュートリアル用のsessionStorageをクリア
        sessionStorage.clear();
        await signOut(auth);
        // 必要に応じてリダイレクト
        window.location.href = '/login';
      } catch (error) {
        console.error('ログアウトエラー:', error);
      }
    }, timeoutMinutes * 60 * 1000);
  };

  // アクティビティイベントを監視
  useEffect(() => {
    if (!enabled) return;

    const handleActivity = () => {
      resetTimer();
      startTimer();
    };

    // アクティビティイベントを登録
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // 初期タイマーを開始
    startTimer();

    // クリーンアップ
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [timeoutMinutes, enabled]);

  // 手動でタイマーをリセットする関数
  const refreshSession = () => {
    resetTimer();
    startTimer();
  };

  return { refreshSession };
};
