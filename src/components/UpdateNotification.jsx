/**
 * PWA更新通知コンポーネント
 * 新しいバージョンが利用可能な時にユーザーに通知し、更新を促す
 */
import { usePWAUpdate } from '../hooks/usePWAUpdate';
import Button from './Button';

const UpdateNotification = () => {
  const { updateAvailable, updateApp, dismissUpdate, showTestUpdate } = usePWAUpdate();

  // 開発環境ではテストボタンを表示
  const isDevelopment = import.meta.env.DEV;

  if (!updateAvailable && !isDevelopment) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        {isDevelopment && !updateAvailable ? (
          // 開発環境用テストボタン
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">PWA更新テスト</p>
            <Button
              onClick={showTestUpdate}
              className="text-xs px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white"
            >
              更新通知をテスト
            </Button>
          </div>
        ) : (
          // 本番用更新通知
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg 
                className="h-6 w-6 text-blue-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-gray-900">
                新しいバージョンが利用可能です
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                アプリを更新して最新の機能をお楽しみください。
              </p>
              <div className="mt-3 flex space-x-2">
                <Button
                  onClick={updateApp}
                  className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  今すぐ更新
                </Button>
                <button
                  onClick={dismissUpdate}
                  className="text-xs px-3 py-1.5 text-gray-600 hover:text-gray-800"
                >
                  後で
                </button>
              </div>
            </div>
            <div className="ml-4 flex-shrink-0">
              <button
                onClick={dismissUpdate}
                className="inline-flex text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdateNotification;
