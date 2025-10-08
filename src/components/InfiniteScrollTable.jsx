/**
 * 無限スクロール対応テーブルコンポーネント
 * スクロール時に自動でデータを読み込む
 */
import React, { useEffect, useRef } from 'react';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import LoadingSpinner from './LoadingSpinner';

const InfiniteScrollTable = ({
  collectionName,
  orderByField = 'date',
  orderDirection = 'desc',
  pageSize = 20,
  columns = [],
  renderRow,
  className = ""
}) => {
  const {
    data,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore
  } = useInfiniteScroll(collectionName, orderByField, orderDirection, pageSize);

  const observerRef = useRef();
  const loadingRef = useRef();

  // Intersection Observerでスクロール検知
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadMore]);

  if (loading) {
    return <LoadingSpinner message="データを読み込み中..." fullScreen />;
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600 mb-4">エラーが発生しました: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <div className={`overflow-auto ${className}`}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            {columns.map((column, index) => (
              <th 
                key={index}
                className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={item.id || index} className="hover:bg-gray-50">
              {renderRow ? renderRow(item, index) : (
                <td className="border border-gray-300 px-4 py-2">
                  {JSON.stringify(item)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* ローディング表示（スクロール検知用） */}
      {loadingMore && (
        <div ref={loadingRef} className="flex justify-center p-4">
          <LoadingSpinner message="さらに読み込み中..." size="sm" />
        </div>
      )}
      
      {/* データ終了表示 */}
      {!hasMore && data.length > 0 && (
        <div className="text-center p-4 text-gray-500">
          すべてのデータを表示しました
        </div>
      )}
      
      {/* データなし表示 */}
      {!loading && data.length === 0 && (
        <div className="text-center p-8 text-gray-500">
          データがありません
        </div>
      )}
    </div>
  );
};

export default InfiniteScrollTable;
