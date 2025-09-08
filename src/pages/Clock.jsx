import React, { useEffect, useState } from "react";
import Button from "../components/Button.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Modal from "../components/Modal.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useClock } from "../hooks/useClock.js";

/**
 * 打刻ページコンポーネント
 * 日付・時刻表示と出勤・退勤ボタンを提供
 */
function Clock() {
  const [now, setNow] = useState(new Date());

  // 認証フックを使用
  const { userId, isAuthChecked, logout } = useAuth({
    requireAuth: true, //true: 認証必須
    redirectTo: '/login' //未認証時のリダイレクト先
  });

  // 打刻フックを使用
  const {
    todayStatus,
    completeMessage,
    isDataLoaded,
    handleClockIn,
    handleClockOut,
    setCompleteMessage
  } = useClock(userId, isAuthChecked);

  // 現在時刻を1秒ごとに更新
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 打刻処理は useClock フックで管理

  // 認証状態とデータの読み込みが完了するまでローディング表示
  if (!isAuthChecked || !isDataLoaded) {
    return <LoadingSpinner fullScreen={true} />;
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 md:p-6 md:pt-24 pb-20 md:pb-24">
      {/* ポップアップメッセージ */}
      <Modal
        isOpen={!!completeMessage}
        onClose={() => setCompleteMessage("")}
        size="md"
        showCloseButton={false}
        className="text-center"
      >
                    {completeMessage.includes("退勤の打刻が完了しました") ? (
              <>
                <div>退勤の打刻が完了しました。</div>
                <div className="text-blue-500 text-2xl font-bold mt-2">お疲れさまでした！</div>
                <div className="mt-4 text-sm text-gray-600">ログアウトしますか？</div>
                <div className="flex justify-center gap-4 mt-4">
                  <Button
                    onClick={() => setCompleteMessage("")}
                    variant="secondary"
                    className="px-4 py-2"
                  >
                    キャンセル
                  </Button>
                  <Button
                    onClick={() => {
                      setCompleteMessage("");
                      logout();
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
                  >
                    ログアウト
                  </Button>
                </div>
              </>
            ) : completeMessage === "出勤の打刻が完了しました。今日も一日頑張りましょう！" ? (
          <>
            <div>出勤の打刻が完了しました。</div>
            <div className="text-red-500 text-2xl font-bold mt-2">今日も一日頑張りましょう！</div>
          </>
        ) : null}
      </Modal>
      
      {/* 日付・時刻 */}
      <div className="flex flex-col items-center justify-center min-w-[280px] mb-8 md:mb-16">
        <div className="text-2xl md:text-4xl font-bold text-indigo-600 mb-2 text-center">
          {now.getFullYear()}年{now.getMonth() + 1}月{now.getDate()}日({["日", "月", "火", "水", "木", "金", "土"][now.getDay()]})
        </div>
        <div className="text-4xl md:text-6xl font-mono text-black">
          {now.toLocaleTimeString()}
        </div>
      </div>
      
      {/* 打刻状況 */}
      <div className="flex flex-col justify-center items-center min-w-[280px] mb-8 md:mb-16">
        <div className="text-xl md:text-3xl font-bold text-indigo-600 mb-2">今日の打刻状況</div>
        <div className="text-black text-xl md:text-3xl">
          <div>出勤：{todayStatus.出勤 === "--:--" ? "--:--" : todayStatus.出勤}</div>
          <div>退勤：{todayStatus.退勤 === "--:--" ? "--:--" : todayStatus.退勤}</div>
        </div>
      </div>
      
      {/* 出勤・退勤ボタン */}
      <div className="grid grid-cols-2 gap-4 md:gap-8 w-full max-w-xl mx-auto">
        <Button
          onClick={handleClockIn}
          // disabled={todayStatus.出勤 !== "--:--"}
          variant="none"
          className={`text-base md:text-lg font-bold px-3 md:px-4 h-16 md:h-20 rounded-2xl w-full ${
            todayStatus.出勤 !== "--:--"
              ? "bg-gray-400 cursor-not-allowed text-gray-600"
              : "bg-blue-700 hover:bg-blue-800 text-white"
          }`}
        >
          {todayStatus.出勤 !== "--:--" ? "出勤済み" : "出勤"}
        </Button>
        <Button
          onClick={handleClockOut}
          // disabled={todayStatus.出勤 === "--:--" || todayStatus.退勤 !== "--:--"}
          variant="none"
          className={`text-base md:text-lg font-bold px-3 md:px-4 h-16 md:h-20 rounded-2xl w-full ${
            todayStatus.出勤 === "--:--" || todayStatus.退勤 !== "--:--"
              ? "bg-gray-400 cursor-not-allowed text-gray-600"
              : "bg-red-600 hover:bg-red-700 text-white"
          }`}
        >
          {todayStatus.退勤 !== "--:--" ? "退勤済み" : "退勤"}
        </Button>
      </div>
    </div>
  );
}

export default Clock; 