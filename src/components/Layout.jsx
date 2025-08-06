import React, { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import Button from "./Button";
import Header from "./Header";
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
      <Header showNavigation={true} onLogout={handleLogout} userEmail={isAuthChecked ? userEmail : undefined} className="fixed top-0 left-0 w-full z-10" />
      
      {/* メインコンテンツ */}
      <main className="min-h-screen w-full bg-gray-200 pt-[116px] flex overflow-hidden">
        {/* 左：メニュー群（30%） - 固定 */}
        <div className="bg-white flex flex-col m-0 p-0 shadow-lg fixed left-0 top-[116px] h-[calc(100vh-116px)] overflow-hidden" style={{ width: "250px", boxShadow: "4px 0 4px -4px rgba(0,0,0,0.42)" }}>
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
        
        {/* 右：メインコンテンツ（70%） - ここだけスクロール可能 */}
        <div className="flex-1 bg-gray-100 relative ml-[250px] overflow-auto" style={{ height: "calc(100vh - 116px)" }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout; 