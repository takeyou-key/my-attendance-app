import React, { useEffect, useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import Button from "./Button.jsx";
import Header from "./Header.jsx";
import { getAuth, onAuthStateChanged } from "firebase/auth";


/**
 * 共通レイアウトコンポーネント
 * ヘッダーとメニューを固定し、コンテンツ部分だけが切り替わる
 */
function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
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
    <div className="flex flex-col overflow-hidden" style={{ height: '100dvh' }}>
      {/* ヘッダー（上部固定） */}
      <Header 
        showNavigation={true} 
        onLogout={handleLogout} 
        userEmail={isAuthChecked ? userEmail : undefined} 
        className="fixed top-0 left-0 w-full z-10"
      />
      
      {/* メインコンテンツ */}
      <main className="flex-1 flex overflow-hidden pt-[78px] md:pt-[116px]">
        {/* デスクトップ用メニュー */}
        <div className="hidden lg:block bg-white flex flex-col shadow-lg" style={{ width: "250px" }}>
          <Button
            onClick={() => navigate('/home')}
            variant="none"
            className={`text-lg font-bold px-4 h-20 w-full border-b border-gray-300 flex items-center justify-between ${
              location.pathname === '/home' 
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' 
                : 'bg-white text-blue-700 hover:bg-blue-50'
            }`}
          >
            <span>打刻</span>
          </Button>
          <Button
            onClick={() => navigate('/home/history')}
            variant="none"
            className={`text-lg font-bold px-4 h-20 w-full border-b border-gray-300 flex items-center justify-between ${
              location.pathname === '/home/history' 
                ? 'bg-green-50 text-green-700 border-l-4 border-green-700' 
                : 'bg-white text-green-600 hover:bg-green-50'
            }`}
          >
            <span>実績確認・修正</span>
          </Button>
          <Button
            onClick={() => navigate('/home/requestlist')}
            variant="none"
            className={`text-lg font-bold px-4 h-20 w-full border-b border-gray-300 flex items-center justify-between ${
              location.pathname === '/home/requestlist' 
                ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-700' 
                : 'bg-white text-purple-600 hover:bg-purple-50'
            }`}
          >
            <span>申請一覧</span>
          </Button>
          <Button
            onClick={() => navigate('/home/settings')}
            variant="none"
            className={`text-lg font-bold px-4 h-20 w-full border-b border-gray-300 flex items-center justify-between ${
              location.pathname === '/home/settings' 
                ? 'bg-orange-50 text-orange-700 border-l-4 border-orange-700' 
                : 'bg-white text-orange-600 hover:bg-orange-50'
            }`}
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
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  location.pathname === '/home' ? 'bg-blue-50' : ''
                }`}
              >
                <svg className={`w-6 h-6 mb-1 ${location.pathname === '/home' ? 'text-blue-700' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className={`text-xs font-medium ${location.pathname === '/home' ? 'text-blue-700' : 'text-blue-600'}`}>打刻</span>
              </button>
              
              <button
                onClick={() => navigate('/home/history')}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  location.pathname === '/home/history' ? 'bg-green-50' : ''
                }`}
              >
                <svg className={`w-6 h-6 mb-1 ${location.pathname === '/home/history' ? 'text-green-700' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className={`text-xs font-medium ${location.pathname === '/home/history' ? 'text-green-700' : 'text-green-600'}`}>履歴</span>
              </button>
              
              <button
                onClick={() => navigate('/home/requestlist')}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  location.pathname === '/home/requestlist' ? 'bg-purple-50' : ''
                }`}
              >
                <svg className={`w-6 h-6 mb-1 ${location.pathname === '/home/requestlist' ? 'text-purple-700' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className={`text-xs font-medium ${location.pathname === '/home/requestlist' ? 'text-purple-700' : 'text-purple-600'}`}>申請</span>
              </button>
              
              <button
                onClick={() => navigate('/home/settings')}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  location.pathname === '/home/settings' ? 'bg-orange-50' : ''
                }`}
              >
                <svg className={`w-6 h-6 mb-1 ${location.pathname === '/home/settings' ? 'text-orange-700' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className={`text-xs font-medium ${location.pathname === '/home/settings' ? 'text-orange-700' : 'text-orange-600'}`}>設定</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* メインコンテンツ */}
        <div className="flex-1 bg-gray-100 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout; 