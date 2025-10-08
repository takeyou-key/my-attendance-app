/**
 * 無限スクロール用カスタムフック
 * Firestoreのページネーション機能を使用してスクロールごとにデータを読み込む
 * 
 * @param {string} collectionName - Firestoreコレクション名
 * @param {string} orderByField - ソートフィールド
 * @param {string} orderDirection - ソート方向 ('asc' | 'desc')
 * @param {number} pageSize - 1回の読み込み件数（デフォルト: 20）
 * @returns {Object} データ、読み込み状態、エラー、次のページ読み込み関数
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  startAfter, 
  getDocs,
  DocumentSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase';

export const useInfiniteScroll = (
  collectionName, 
  orderByField = 'date', 
  orderDirection = 'desc',
  pageSize = 20
) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);

  // 初期データ読み込み
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const firstQuery = query(
        collection(db, collectionName),
        orderBy(orderByField, orderDirection),
        limit(pageSize)
      );

      const snapshot = await getDocs(firstQuery);
      const newData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setData(newData);
      
      // 最後のドキュメントを保存（次のページ読み込み用）
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      setLastVisible(lastDoc);
      
      // 取得件数がpageSizeより少なければ、これ以上データがない
      setHasMore(snapshot.docs.length === pageSize);

    } catch (err) {
      console.error('初期データ読み込みエラー:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [collectionName, orderByField, orderDirection, pageSize]);

  // 次のページ読み込み
  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || !lastVisible) return;

    try {
      setLoadingMore(true);
      setError(null);

      const nextQuery = query(
        collection(db, collectionName),
        orderBy(orderByField, orderDirection),
        startAfter(lastVisible),
        limit(pageSize)
      );

      const snapshot = await getDocs(nextQuery);
      const newData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // 既存データに追加
      setData(prevData => [...prevData, ...newData]);
      
      // 最後のドキュメントを更新
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      setLastVisible(lastDoc);
      
      // 取得件数がpageSizeより少なければ、これ以上データがない
      setHasMore(snapshot.docs.length === pageSize);

    } catch (err) {
      console.error('追加データ読み込みエラー:', err);
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  }, [collectionName, orderByField, orderDirection, pageSize, hasMore, loadingMore, lastVisible]);

  // データリセット
  const reset = useCallback(() => {
    setData([]);
    setLastVisible(null);
    setHasMore(true);
    setError(null);
  }, []);

  // 初期読み込み
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  return {
    data,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    reset,
    refetch: loadInitialData
  };
};
