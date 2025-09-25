import React, { useEffect, useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import Button from "./Button.jsx";
import Header from "./Header.jsx";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { FaClock, FaHistory, FaListAlt, FaCog } from 'react-icons/fa';


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
            className={`text-lg font-bold px-4 h-20 w-full flex items-center justify-between transition-all duration-200 rounded-none ${location.pathname === '/home'
                ? 'bg-blue-50 text-blue-700 border-l-8 border-blue-700 shadow-md'
                : 'bg-white text-blue-700 hover:bg-blue-50 hover:shadow-md border-b border-gray-300'
              }`}
          >
            <span className="flex items-center gap-3">
              <FaClock className="w-5 h-5" />
              打刻
            </span>
          </Button>
          <Button
            onClick={() => navigate('/home/history')}
            variant="none"
            className={`text-lg font-bold px-4 h-20 w-full border-b border-gray-300 flex items-center justify-between transition-all duration-200 rounded-none ${location.pathname === '/home/history'
                ? 'bg-green-50 text-green-700 border-l-8 border-green-700 shadow-md'
                : 'bg-white text-green-600 hover:bg-green-50 hover:shadow-md'
              }`}
          >
            <span className="flex items-center gap-3">
              <FaHistory className="w-5 h-5" />
              実績確認・修正
            </span>
          </Button>
          <Button
            onClick={() => navigate('/home/requestlist')}
            variant="none"
            className={`text-lg font-bold px-4 h-20 w-full border-b border-gray-300 flex items-center justify-between transition-all duration-200 rounded-none ${location.pathname === '/home/requestlist'
                ? 'bg-purple-50 text-purple-700 border-l-8 border-purple-700 shadow-md'
                : 'bg-white text-purple-600 hover:bg-purple-50 hover:shadow-md'
              }`}
          >
            <span className="flex items-center gap-3">
              <FaListAlt className="w-5 h-5" />
              申請一覧
            </span>
          </Button>
        </div>

        {/* モバイル用下部固定ナビゲーション */}
        <div className="lg:hidden">
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
            <div className="flex items-center justify-around py-2">
              <button
                onClick={() => navigate('/home')}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${location.pathname === '/home' ? 'bg-blue-50' : ''
                  }`}
              >
                <FaClock className={`w-6 h-6 mb-1 ${location.pathname === '/home' ? 'text-blue-700' : 'text-blue-600'}`} />
                <span className={`text-xs font-medium ${location.pathname === '/home' ? 'text-blue-700' : 'text-blue-600'}`}>打刻</span>
              </button>

              <button
                onClick={() => navigate('/home/history')}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${location.pathname === '/home/history' ? 'bg-green-50' : ''
                  }`}
              >
                <FaHistory className={`w-6 h-6 mb-1 ${location.pathname === '/home/history' ? 'text-green-700' : 'text-green-600'}`} />
                <span className={`text-xs font-medium ${location.pathname === '/home/history' ? 'text-green-700' : 'text-green-600'}`}>確認・修正</span>
              </button>

              <button
                onClick={() => navigate('/home/requestlist')}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${location.pathname === '/home/requestlist' ? 'bg-purple-50' : ''
                  }`}
              >
                <FaListAlt className={`w-6 h-6 mb-1 ${location.pathname === '/home/requestlist' ? 'text-purple-700' : 'text-purple-600'}`} />
                <span className={`text-xs font-medium ${location.pathname === '/home/requestlist' ? 'text-purple-700' : 'text-purple-600'}`}>申請一覧</span>
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