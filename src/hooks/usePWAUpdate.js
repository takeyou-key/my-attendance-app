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
      console.log('Service Worker supported');
      
      // Service Workerの更新を監視
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('SW message received:', event.data);
        if (event.data && event.data.type === 'SW_UPDATE_AVAILABLE') {
          console.log('Update available via message');
          setUpdateAvailable(true);
          setWaitingWorker(event.data.waitingWorker);
        }
      });

      // Service Workerの状態変化を監視
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Controller changed, reloading page');
        window.location.reload();
      });

      // ページロード時にService Workerの状態をチェック
      navigator.serviceWorker.ready.then((registration) => {
        console.log('SW ready, registration:', registration);
        
        if (registration.waiting) {
          console.log('Update available on ready');
          setUpdateAvailable(true);
          setWaitingWorker(registration.waiting);
        }

        // Service Workerの更新を監視
        registration.addEventListener('updatefound', () => {
          console.log('Update found');
          const newWorker = registration.installing;
          
          newWorker.addEventListener('statechange', () => {
            console.log('New worker state:', newWorker.state);
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New service worker installed');
              setUpdateAvailable(true);
              setWaitingWorker(newWorker);
            }
          });
        });
      });
    } else {
      console.log('Service Worker not supported');
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

  /**
   * テスト用：手動で更新通知を表示
   */
  const showTestUpdate = () => {
    console.log('Showing test update notification');
    setUpdateAvailable(true);
  };

  return {
    updateAvailable,
    updateApp,
    dismissUpdate,
    showTestUpdate
  };
};
