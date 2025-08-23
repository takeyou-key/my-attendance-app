import React, { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import Button from "./Button.jsx";
import Header from "./Header.jsx";
import { getAuth, onAuthStateChanged } from "firebase/auth";


/**
 * 共通レイアウトコンポーネント
 * ヘッダーとメニューを固定し、コンテンツ部分だけが切り替わる
 */
function Layout() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");
  const [isAuthChecked, setIsAuthChecked] = useState(false);




  const auth = getAuth();

  // 認証状態の監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
        localStorage.setItem('userEmail', user.email);
      } else {
        setUserEmail("");
        localStorage.removeItem('userEmail');
      }
      setIsAuthChecked(true);
    });

    return () => unsubscribe();
  }, [auth]);

  // ログアウト処理
  const handleLogout = () => {
    // ユーザー情報をクリア
    localStorage.removeItem('userEmail');
    auth.signOut();
    navigate("/login");
  };



  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      {/* ヘッダー（上部固定） */}
      <Header 
        showNavigation={true} 
        onLogout={handleLogout} 
        userEmail={isAuthChecked ? userEmail : undefined} 
        className="fixed top-0 left-0 w-full z-10"
      />
      
      {/* メインコンテンツ */}
      <main className="min-h-screen w-full bg-gray-200 pt-16 md:pt-[116px] flex overflow-hidden">
        {/* デスクトップ用メニュー */}
        <div className="hidden lg:block bg-white flex flex-col m-0 p-0 shadow-lg fixed left-0 top-16 md:top-[116px] h-[calc(100vh-4rem)] md:h-[calc(100vh-116px)] overflow-hidden" style={{ width: "250px", boxShadow: "4px 0 4px -4px rgba(0,0,0,0.42)" }}>
          <Button
            onClick={() => navigate('/home')}
            variant="none"
            className="text-lg font-bold px-4 h-20 w-full bg-white text-blue-700 border-b border-gray-300 hover:bg-blue-50 flex items-center justify-between"
          >
            <span>打刻</span>
          </Button>
          <Button
            onClick={() => navigate('/home/history')}
            variant="none"
            className="text-lg font-bold px-4 h-20 w-full bg-white text-green-600 border-b border-gray-300 hover:bg-green-50 flex items-center justify-between"
          >
            <span>実績確認・申請</span>
          </Button>
          <Button
            onClick={() => navigate('/home/requestlist')}
            variant="none"
            className="text-lg font-bold px-4 h-20 w-full bg-white text-purple-600 border-b border-gray-300 hover:bg-purple-50 flex items-center justify-between"
          >
            <span>申請一覧</span>
          </Button>
          <Button
            onClick={() => navigate('/home/settings')}
            variant="none"
            className="text-lg font-bold px-4 h-20 w-full bg-white text-orange-600 border-b border-gray-300 hover:bg-orange-50 flex items-center justify-between"
          >
            <span>設定</span>
          </Button>
        </div>
        
        {/* モバイル用下部固定ナビゲーション */}
        <div className="lg:hidden">
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
            <div className="flex items-center justify-around py-2">
              <button
                onClick={() => navigate('/home')}
                className="flex flex-col items-center py-2 px-3 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-blue-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs text-blue-600 font-medium">打刻</span>
              </button>
              
              <button
                onClick={() => navigate('/home/history')}
                className="flex flex-col items-center py-2 px-3 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-green-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="text-xs text-green-600 font-medium">履歴</span>
              </button>
              
              <button
                onClick={() => navigate('/home/requestlist')}
                className="flex flex-col items-center py-2 px-3 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-purple-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-xs text-purple-600 font-medium">申請</span>
              </button>
              
              <button
                onClick={() => navigate('/home/settings')}
                className="flex flex-col items-center py-2 px-3 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-orange-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs text-orange-600 font-medium">設定</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* メインコンテンツ */}
        <div className="flex-1 bg-gray-100 relative overflow-auto lg:ml-[250px]" style={{ height: "calc(100vh - 4rem)", "@media (min-width: 768px)": { height: "calc(100vh - 116px)" } }}>
          <div className="h-full pb-16 lg:pb-0">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}

export default Layout; 