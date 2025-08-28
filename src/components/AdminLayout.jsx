import React, { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import Button from "./Button.jsx";
import Header from "./Header.jsx";
import AuthGuard from "./AuthGuard.jsx";


/**
 * 管理者用共通レイアウトコンポーネント
 * ヘッダーとメニューを固定し、コンテンツ部分だけが切り替わる
 */
function AdminLayout() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");
  const [isAuthChecked, setIsAuthChecked] = useState(false);


  // 管理者画面用の独立した認証状態管理
  useEffect(() => {
    // 管理者画面では独立した認証状態を管理
    const adminEmailFromStorage = localStorage.getItem('adminEmail');
    if (adminEmailFromStorage) {
      setUserEmail(adminEmailFromStorage);
    } else {
      setUserEmail("");
    }
    setIsAuthChecked(true);
  }, []);

  // ログアウト処理
  const handleLogout = () => {
    // 管理者情報をクリア
    localStorage.removeItem('adminEmail');
    navigate("/login");
  };



  return (
    <AuthGuard>
      <div className="flex flex-col overflow-hidden" style={{ height: '100dvh' }}>
        {/* ヘッダー */}
        <Header 
          showNavigation={true} 
          onLogout={handleLogout} 
          userEmail={userEmail} 
          className="fixed top-0 left-0 w-full z-10"
          bgColor="#059669"
          textColor="#10b981"
        />
        
        {/* メインコンテンツ */}
        <main className="w-full bg-gray-200 pt-[78px] md:pt-[116px] flex overflow-hidden" style={{ height: '100dvh' }}>
          {/* デスクトップ用メニュー */}
          <div className="hidden lg:block bg-white flex flex-col m-0 p-0 shadow-lg fixed left-0 top-[78px] md:top-[116px] h-[calc(100vh-78px)] md:h-[calc(100vh-116px)] overflow-hidden" style={{ width: "250px", boxShadow: "4px 0 4px -4px rgba(0,0,0,0.42)" }}>
            <Button
              onClick={() => navigate('/admin')}
              variant="none"
              className="text-lg font-bold px-4 h-20 w-full bg-white text-green-600 border-b border-gray-300 hover:bg-purple-50 flex items-center justify-between"
            >
              <span>申請確認・承認</span>
            </Button>
          </div>
          
          {/* モバイル用下部固定ナビゲーション */}
          <div className="lg:hidden">
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
              <div className="flex items-center justify-around py-2">
                <button
                  onClick={() => navigate('/admin')}
                  className="flex flex-col items-center py-2 px-3 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-purple-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-xs text-purple-600 font-medium">申請確認</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* メインコンテンツ */}
          <div className="flex-1 bg-gray-100 relative overflow-auto lg:ml-[250px]" style={{ height: "calc(100vh - 78px)", "@media (min-width: 768px)": { height: "calc(100vh - 116px)" } }}>
            <div className="pb-16 lg:pb-0">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}

export default AdminLayout; 