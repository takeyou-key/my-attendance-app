/**
 * カスタムService Worker
 * PWAの更新とキャッシュ戦略を管理
 */

// Service Workerがインストールされた時の処理
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  // 新しいService Workerを即座にアクティブにする
  self.skipWaiting();
});

// Service Workerがアクティブになった時の処理
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  // 既存のクライアントを即座に制御下に置く
  event.waitUntil(self.clients.claim());
});

// Service Workerが更新可能になった時の処理
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 新しいService Workerが利用可能になった時の処理
self.addEventListener('controllerchange', () => {
  console.log('Service Worker controller changed');
});

// ネットワークエラーの処理
self.addEventListener('fetch', (event) => {
  // APIリクエストはネットワークファースト
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // ネットワークエラーの場合はオフライン用レスポンス
        return new Response(
          JSON.stringify({ error: 'ネットワークに接続できません' }),
          {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'application/json' }
          }
        );
      })
    );
  }
});
