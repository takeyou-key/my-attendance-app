import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import LoadingSpinner from './LoadingSpinner';

/**
 * 認証ガードコンポーネント
 * アプリケーション全体で使用される統一された認証状態の確認とローディング表示
 * 
 * @param {Object} props - コンポーネントのプロパティ
 * @param {React.ReactNode} props.children - 認証後に表示するコンテンツ
 * @param {string} props.redirectTo - 未認証時のリダイレクト先（デフォルト: "/login"）
 * @param {boolean} props.requireAuth - 認証が必要かどうか（デフォルト: true）
 * @param {function} props.onAuthStateChange - 認証状態変更時のコールバック関数
 * @param {string} props.loadingMessage - ローディングメッセージ（デフォルト: "認証確認中..."）
 */
const AuthGuard = ({ 
  children, 
  redirectTo = "/login",
  requireAuth = true,
  onAuthStateChange,
  loadingMessage = "認証確認中..."
}) => {
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthChecked(true);
      
      // コールバック関数が提供されている場合は実行
      if (onAuthStateChange) {
        onAuthStateChange(currentUser);
      }
      
      // 認証が必要で、ユーザーが未認証の場合はリダイレクト
      if (requireAuth && !currentUser) {
        navigate(redirectTo);
      }
    });

    return () => unsubscribe();
  }, [auth, navigate, redirectTo, requireAuth, onAuthStateChange]);

  // 認証状態の確認中はローディング表示
  if (!isAuthChecked) {
    return <LoadingSpinner message={loadingMessage} fullScreen={true} />;
  }

  // 認証が必要で、ユーザーが未認証の場合は何も表示しない
  if (requireAuth && !user) {
    return null;
  }

  // 認証が不要で、ユーザーが認証済みの場合はリダイレクト（ログイン画面など）
  if (!requireAuth && user) {
    navigate('/home');
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard; 