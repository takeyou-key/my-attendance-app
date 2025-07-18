import React, { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import Button from "../components/Button";
import Header from "../components/Header";
import PopoutMessage from "../components/PopoutMessage";
import { auth } from "../firebase";

function Home() {
  const navigate = useNavigate(); // ページ遷移（画面移動）を行うためのフック
  const [now, setNow] = useState(new Date()); //
  const [todayStatus, setTodayStatus] = useState({
    出勤: "--:--",
    退勤: "--:--"
  });
  const [completeMessage, setCompleteMessage] = useState("");
  const userId = "sampleUser"; // 実際はログインユーザーID
  const [userEmail, setUserEmail] = useState("");
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  // Firestoreから今日の打刻状況を取得
  useEffect(() => {
    const fetchTodayStatus = async () => {
      const today = new Date().toISOString().slice(0, 10);
      const docRef = doc(db, "attendance", `${userId}_${today}`); // Firestoreコレクション内のドキュメント参照
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) { // 該当するドキュメントが存在するか確認
        const data = docSnap.data();
        setTodayStatus({
          出勤: data.clockIn || "--:--",
          退勤: data.clockOut || "--:--"
        });
      } else {
        setTodayStatus({ 出勤: "--:--", 退勤: "--:--" });
      }
    };
    fetchTodayStatus();
  }, [userId]); // userIdが変わるたびに処理を再実行する

  // 現在時刻を1秒ごとに更新
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        setUserEmail("");
      }
      setIsAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  // ログイン画面へ遷移
  const handleLogout = () => {
    navigate("/login");
  };

  // 出勤ボタン押下時
  const handleClockIn = async () => {
    const time = now.toLocaleTimeString("ja-JP", { hour12: false });
    const today = new Date().toISOString().slice(0, 10);
    await setDoc(doc(db, "attendance", `${userId}_${today}`), {
      userId,
      date: today,
      clockIn: time,
    }, { merge: true });
    setTodayStatus((prev) => ({ ...prev, 出勤: time }));
    setCompleteMessage("出勤の打刻が完了しました。今日も一日頑張りましょう！");
    setTimeout(() => setCompleteMessage(""), 2000);
  };

  // 退勤ボタン押下時
  const handleClockOut = async () => {
    const time = now.toLocaleTimeString("ja-JP", { hour12: false });
    const today = new Date().toISOString().slice(0, 10);
    await setDoc(doc(db, "attendance", `${userId}_${today}`), {
      userId,
      date: today,
      clockOut: time,
    }, { merge: true });
    setTodayStatus((prev) => ({ ...prev, 退勤: time }));
    setCompleteMessage("退勤の打刻が完了しました。お疲れさまでした！");
    setTimeout(() => setCompleteMessage(""), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* ヘッダー（上部固定） */}
      <Header showNavigation={true} onLogout={handleLogout} userEmail={isAuthChecked ? userEmail : undefined} className="fixed top-0 left-0 w-full z-10" />
      {/* メインコンテンツ（z-indexなし or z-0） */}
      <main className="min-h-screen w-full bg-gray-200 grid grid-rows-[1fr_auto] pt-[88px]">
        {/* 上：メインコンテンツ */}
        <div className="w-full py-[8%] px-16 flex flex-col md:flex-row justify-center items-stretch relative">
          <PopoutMessage show={!!completeMessage}>
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
          </PopoutMessage>
          {/* 左：日付・時刻 */}
          <div className="flex-1 flex flex-col items-center justify-center min-w-[280px]">
            <div className="text-5xl md:text-4xl font-bold text-indigo-600 mb-2">
              {now.getFullYear()}年{now.getMonth() + 1}月{now.getDate()}日({["日","月","火","水","木","金","土"][now.getDay()]})
            </div>
            <div className="text-6xl md:text-4xl font-mono text-black">
              {now.toLocaleTimeString()}
            </div>
          </div>
          {/* 右：打刻状況（現状維持） */}
          <div className="flex-1 flex flex-col justify-center items-center min-w-[280px]">
            <div className="text-3xl font-bold text-indigo-600 mb-2">今日の打刻状況</div>
            <div className="text-black text-3xl">
              <div>出勤：{todayStatus.出勤 === "--:--" ? "--:--" : todayStatus.出勤}</div>
              <div>退勤：{todayStatus.退勤 === "--:--" ? "--:--" : todayStatus.退勤}</div>
            </div>
          </div>
        </div>
        {/* 下：ボタン群 */}
        <div className="w-full bg-white border-t border-gray-300">
          <div className="grid grid-cols-2 gap-8 w-full max-w-xl mx-auto py-10 px-8">
            <Button
              onClick={handleClockIn}
              variant="none"
              className="text-lg font-bold px-4 h-20 rounded-2xl w-full bg-blue-700 hover:bg-blue-800 text-white"
            >
              出勤
            </Button>
            <Button
              onClick={handleClockOut}
              variant="none"
              className="text-lg font-bold px-4 h-20 rounded-2xl w-full bg-red-600 hover:bg-red-700 text-white"
            >
              退勤
            </Button>
            <Button
              onClick={() => navigate('/history')}
              variant="none"
              className="text-lg font-bold px-4 h-20 rounded-2xl w-full bg-green-600 hover:bg-green-700 text-white"
            >
              履歴
            </Button>
            <Button
              onClick={() => navigate('/edit')}
              variant="none"
              className="text-lg font-bold px-4 h-20 rounded-2xl w-full bg-green-600 hover:bg-green-700 text-white"
            >
              修正
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home; 