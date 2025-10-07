/**
 * PWA更新管理フック
 * Service Workerの更新を検知し、ユーザーに更新通知を表示する
 * 
 * @returns {Object} 更新状態と更新処理関数
 */
import { useState, useEffect } from 'react';

export const usePWAUpdate = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);

  useEffect(() => {
    // Service Workerの更新を監視
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATE_AVAILABLE') {
          setUpdateAvailable(true);
          setWaitingWorker(event.data.waitingWorker);
        }
      });

      // ページロード時にService Workerの状態をチェック
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.waiting) {
          setUpdateAvailable(true);
          setWaitingWorker(registration.waiting);
        }
      });
    }
  }, []);

  /**
   * アプリケーションを更新する
   * Service Workerをスキップウェイティング状態にして更新を適用
   */
  const updateApp = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      
      // Service Workerが更新されたらページをリロード
      waitingWorker.addEventListener('statechange', (e) => {
        if (e.target.state === 'activated') {
          window.location.reload();
        }
      });
    }
  };

  /**
   * 更新通知を閉じる
   */
  const dismissUpdate = () => {
    setUpdateAvailable(false);
    setWaitingWorker(null);
  };

  return {
    updateAvailable,
    updateApp,
    dismissUpdate
  };
};
