import React, { useEffect, useState } from "react";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";
import Modal from "../components/Modal";
import { useAuth } from "../hooks/useAuth";
import { useClock } from "../hooks/useClock";

/**
 * 打刻ページコンポーネント
 * 日付・時刻表示と出勤・退勤ボタンを提供
 */
function Clock() {
  const [now, setNow] = useState(new Date());

  // 認証フックを使用
  const { userId, isAuthChecked } = useAuth({
    requireAuth: true,
    redirectTo: '/login'
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
    <div className="w-full h-full flex flex-col gap-16 items-center justify-center relative p-8">
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
      
      {/* 日付・時刻 */}
      <div className="flex flex-col items-center justify-center min-w-[280px]">
        <div className="text-5xl md:text-4xl font-bold text-indigo-600 mb-2">
          {now.getFullYear()}年{now.getMonth() + 1}月{now.getDate()}日({["日", "月", "火", "水", "木", "金", "土"][now.getDay()]})
        </div>
        <div className="text-6xl md:text-4xl font-mono text-black">
          {now.toLocaleTimeString()}
        </div>
      </div>
      
      {/* 打刻状況 */}
      <div className="flex flex-col justify-center items-center min-w-[280px]">
        <div className="text-3xl font-bold text-indigo-600 mb-2">今日の打刻状況</div>
        <div className="text-black text-3xl">
          <div>出勤：{todayStatus.出勤 === "--:--" ? "--:--" : todayStatus.出勤}</div>
          <div>退勤：{todayStatus.退勤 === "--:--" ? "--:--" : todayStatus.退勤}</div>
        </div>
      </div>
      
      {/* 出勤・退勤ボタン */}
      <div className="grid grid-cols-2 gap-8 w-full max-w-xl mx-auto py-10 px-8">
        <Button
          onClick={handleClockIn}
          disabled={todayStatus.出勤 !== "--:--"}
          variant="none"
          className={`text-lg font-bold px-4 h-20 rounded-2xl w-full ${
            todayStatus.出勤 !== "--:--"
              ? "bg-gray-400 cursor-not-allowed text-gray-600"
              : "bg-blue-700 hover:bg-blue-800 text-white"
          }`}
        >
          {todayStatus.出勤 !== "--:--" ? "出勤済み" : "出勤"}
        </Button>
        <Button
          onClick={handleClockOut}
          disabled={todayStatus.出勤 === "--:--" || todayStatus.退勤 !== "--:--"}
          variant="none"
          className={`text-lg font-bold px-4 h-20 rounded-2xl w-full ${
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