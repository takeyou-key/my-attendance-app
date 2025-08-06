import React, { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import Button from "./Button";
import Header from "./Header";


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
    <div className="min-h-screen flex flex-col overflow-hidden">
      {/* ヘッダー（上部固定） */}
      <Header showNavigation={true} onLogout={handleLogout} userEmail={isAuthChecked ? userEmail : undefined} className="fixed top-0 left-0 w-full z-10" />
      
      {/* メインコンテンツ */}
      <main className="min-h-screen w-full bg-gray-200 pt-[116px] flex overflow-hidden">
        {/* 左：メニュー群（30%） - 固定 */}
        <div className="bg-white flex flex-col m-0 p-0 shadow-lg fixed left-0 top-[116px] h-[calc(100vh-116px)] overflow-hidden" style={{ width: "250px", boxShadow: "4px 0 4px -4px rgba(0,0,0,0.42)" }}>
          <Button
            onClick={() => navigate('/admin')}
            variant="none"
            className="text-lg font-bold px-4 h-20 w-full bg-white text-purple-600 border-b border-gray-300 hover:bg-purple-50 flex items-center justify-between"
          >
            <span>申請確認・承認</span>
          </Button>
        </div>
        
        {/* 右：メインコンテンツ（70%） - ここだけスクロール可能 */}
        <div className="flex-1 bg-gray-100 relative ml-[250px] overflow-auto" style={{ height: "calc(100vh - 116px)" }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout; 