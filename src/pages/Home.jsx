import React, { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import Button from "../components/Button";
import Header from "../components/Header";
import Modal from "../components/Modal";
import { useAuth } from "../hooks/useAuth";
import { useClock } from "../hooks/useClock";

/**
 * ホームページコンポーネント
 * ログイン直後に表示されるメインページ
 * 打刻機能とナビゲーションメニューを提供
 */
function Home() {
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());

  // 認証フックを使用
  const { userEmail, userId, isAuthChecked, logout } = useAuth({
    requireAuth: true,
    redirectTo: '/login'
  });

  // 打刻フックを使用
  const {
    todayStatus,
    completeMessage,
    handleClockIn,
    handleClockOut,
    setCompleteMessage
  } = useClock(userId, isAuthChecked);

  // 現在時刻を1秒ごとに更新
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 認証状態は useAuth フックで管理

  // 打刻処理は useClock フックで管理

  return (
    <div className="min-h-screen flex flex-col">
      {/* ヘッダー（上部固定） */}
              <Header showNavigation={true} onLogout={logout} userEmail={isAuthChecked ? userEmail : undefined} className="fixed top-0 left-0 w-full z-10" />

      {/* メインコンテンツ */}
      <main className="min-h-screen w-full bg-gray-200 pt-[116px] flex">
        {/* 左：メニュー群（30%） */}
        <div className="bg-white flex flex-col m-0 p-0 shadow-lg" style={{ flexBasis: "30%", minWidth: "250px", maxWidth: "250px", boxShadow: "4px 0 4px -4px rgba(0,0,0,0.42)" }}>
          <Button
            onClick={() => navigate('/home')}
            variant="none"
            className="text-lg font-bold px-4 h-20 w-full bg-white text-blue-700 border-b border-gray-300 hover:bg-blue-50 flex items-center justify-between"
          >
            <span>打刻</span>
            <span className="text-2xl">&gt;</span>
          </Button>
          <Button
            onClick={() => navigate('/home/history')}
            variant="none"
            className="text-lg font-bold px-4 h-20 w-full bg-white text-green-600 border-b border-gray-300 hover:bg-green-50 flex items-center justify-between"
          >
            <span>実績確認・申請</span>
            <span className="text-2xl">&gt;</span>
          </Button>
          <Button
            onClick={() => navigate('/home/requestlist')}
            variant="none"
            className="text-lg font-bold px-4 h-20 w-full bg-white text-purple-600 border-b border-gray-300 hover:bg-purple-50 flex items-center justify-between"
          >
            <span>申請一覧</span>
            <span className="text-2xl">&gt;</span>
          </Button>
        </div>

        {/* 右：メインコンテンツ（70%） */}
        <div className="flex-1 bg-gray-100 grid place-items-center relative">
          {/* ポップアップメッセージ */}
          <Modal
            isOpen={!!completeMessage}
            onClose={() => setCompleteMessage("")}
            size="md"
            showCloseButton={false}
            className="text-center"
          >
            {completeMessage === "退勤の打刻が完了しました。お疲れさまでした！" ? (
              <>
                <div>退勤の打刻が完了しました。</div>
                <div className="text-blue-500 text-2xl font-bold mt-2">お疲れさまでした！</div>
              </>
            ) : completeMessage === "出勤の打刻が完了しました。今日も一日頑張りましょう！" ? (
              <>
                <div>出勤の打刻が完了しました。</div>
                <div className="text-red-500 text-2xl font-bold mt-2">今日も一日頑張りましょう！</div>
              </>
            ) : null}
          </Modal>

          {/* 子ルートが存在する場合はOutletを表示、そうでなければClockのUIを表示 */}
          <Outlet context={{ now, todayStatus, completeMessage, handleClockIn, handleClockOut }} />
        </div>
      </main>
    </div>
  );
}

export default Home; 