import React, { useEffect, useState } from "react";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";
import Modal from "../components/Modal";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";

/**
 * 打刻ページコンポーネント
 * 日付・時刻表示と出勤・退勤ボタンを提供
 */
function Clock() {
  const [now, setNow] = useState(new Date());
  const [todayStatus, setTodayStatus] = useState({
    出勤: "--:--",
    退勤: "--:--"
  });
  const [completeMessage, setCompleteMessage] = useState("");
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const auth = getAuth();
  const [userId, setUserId] = useState(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  // 認証状態の監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
      setIsAuthChecked(true);
    });

    return () => unsubscribe();
  }, [auth]);

  // 現在時刻を1秒ごとに更新
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 今日の出勤・退勤状況を取得
  useEffect(() => {
    if (!userId || !isAuthChecked) {
      setTodayStatus({ 出勤: "--:--", 退勤: "--:--" });
      setIsDataLoaded(false);
      return;
    }
    const fetchToday = async () => {
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10);
      const docRef = doc(db, "attendances", `${userId}_${dateStr}`);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTodayStatus({
          出勤: data.clockIn || "--:--",
          退勤: data.clockOut || "--:--"
        });
      } else {
        setTodayStatus({ 出勤: "--:--", 退勤: "--:--" });
      }
      setIsDataLoaded(true);
    };
    fetchToday();
  }, [now, userId, isAuthChecked]);

  // 出勤打刻
  const handleClockIn = async () => {
    if (!userId) return;
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10);
    const timeStr = today.toTimeString().slice(0, 5);
    const docRef = doc(db, "attendances", `${userId}_${dateStr}`);
    await setDoc(docRef, {
      userId,
      date: dateStr,
      clockIn: timeStr,
      clockOut: "--:--",
      workTime: "",
      overTime: "",
      status: "",
      comment: ""
    }, { merge: true });
    setCompleteMessage("出勤の打刻が完了しました。今日も一日頑張りましょう！");
    setTimeout(() => setCompleteMessage(""), 2000);
    setTodayStatus((prev) => ({ ...prev, 出勤: timeStr }));
  };

  // 退勤打刻
  const handleClockOut = async () => {
    if (!userId) return;
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10);
    const timeStr = today.toTimeString().slice(0, 5);
    const docRef = doc(db, "attendances", `${userId}_${dateStr}`);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const start = data.clockIn;
      const end = timeStr;
      if (start && start !== "--:--") {
        const [sh, sm] = start.split(":").map(Number);
        const [eh, em] = end.split(":").map(Number);
        let workMinutes = (eh * 60 + em) - (sh * 60 + sm);
        if (workMinutes < 0) workMinutes += 24 * 60;
        const workTime = `${String(Math.floor(workMinutes / 60)).padStart(2, "0")}:${String(workMinutes % 60).padStart(2, "0")}`;
        await updateDoc(docRef, {
          clockOut: end,
          workTime
        });
        setCompleteMessage("退勤の打刻が完了しました。お疲れさまでした！");
        setTimeout(() => setCompleteMessage(""), 3000);
        setTodayStatus((prev) => ({ ...prev, 退勤: end }));
      }
    }
  };

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