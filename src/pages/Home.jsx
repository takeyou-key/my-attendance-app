import React, { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { db } from "../firebase";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import Button from "../components/Button";
import Header from "../components/Header";
import Modal from "../components/Modal";
import { getAuth } from "firebase/auth";

/**
 * ホームページコンポーネント
 * ログイン直後に表示されるメインページ
 * 打刻機能とナビゲーションメニューを提供
 */
function Home() {
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());
  const [todayStatus, setTodayStatus] = useState({
    出勤: "--:--",
    退勤: "--:--"
  });
  const [completeMessage, setCompleteMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  const auth = getAuth();
  const [userId, setUserId] = useState(null);

  // 現在時刻を1秒ごとに更新
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 認証状態の監視
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
        setUserEmail(user.email);
      } else {
        setUserId(null);
        setUserEmail("");
      }
      setIsAuthChecked(true);
    });
    return () => unsubscribe();
  }, [auth]);

  // 今日の出勤・退勤状況を取得
  useEffect(() => {
    if (!userId || !isAuthChecked) {
      setTodayStatus({ 出勤: "--:--", 退勤: "--:--" });
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
    };
    fetchToday();
  }, [now, userId, isAuthChecked]);

  // ログアウト処理
  const handleLogout = () => {
    navigate("/login");
  };

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

  return (
    <div className="min-h-screen flex flex-col">
      {/* ヘッダー（上部固定） */}
      <Header showNavigation={true} onLogout={handleLogout} userEmail={isAuthChecked ? userEmail : undefined} className="fixed top-0 left-0 w-full z-10" />

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