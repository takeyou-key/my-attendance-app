/**
 * 認証状態管理カスタムフック
 * Firebase Authenticationの状態管理を統一する
 * 
 * 主な機能:
 * - 認証状態の監視
 * - ユーザー情報の管理
 * - 認証チェック状態の管理
 * - ログアウト処理
 * 
 * 制限事項:
 * - Firebase Authenticationが必要
 * - コンポーネント内でのみ使用可能
 */

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

/**
 * 認証状態管理フック
 * @param {Object} options - オプション設定
 * @param {string} options.redirectTo - ログアウト時のリダイレクト先
 * @param {boolean} options.requireAuth - 認証必須フラグ
 * @returns {Object} 認証状態とユーザー情報
 */
export const useAuth = (options = {}) => {
  const { redirectTo = '/login', requireAuth = false } = options;
  
  const [user, setUser] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // 認証状態の監視
  useEffect(() => {
    const auth = getAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setUserEmail(user.email);
        setUserId(user.uid);
      } else {
        setUser(null);
        setUserEmail(null);
        setUserId(null);
        
        // 認証必須でログインしていない場合はリダイレクト
        if (requireAuth) {
          navigate(redirectTo);
        }
      }
      
      setIsAuthChecked(true);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [navigate, redirectTo, requireAuth]);

 // ログアウト処理（アンマウント時にログアウト）
  const logout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      // チュートリアル用のsessionStorageをクリア
      console.log('🧹 Clearing sessionStorage on logout');
      sessionStorage.clear();
      //signOut(auth)の内部でonAuthStateChangedが発火し並行実行しているため、ログアウト後にリダイレクトする
      console.log('ログアウト成功:ユーザーをリダイレクトしました');
      navigate(redirectTo);
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  }; 

  return {
    user,
    userEmail,
    userId,
    isAuthChecked,
    isLoading,
    logout,
    isAuthenticated: !!user
  };
}; 