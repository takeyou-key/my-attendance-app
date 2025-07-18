import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from '../components/Button';
import { auth } from "../firebase";
import Header from '../components/Header';

// 仮の勤怠データ
const mockData = [
  { date: "2024-06-01", start: "09:00", end: "18:00", work: "9:00" },
  { date: "2024-06-02", start: "09:10", end: "18:05", work: "8:55" },
  { date: "2024-06-03", start: "09:00", end: "17:50", work: "8:50" },
  // ...
];

function getYearMonth(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function History() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");
  const [isAuthChecked, setIsAuthChecked] = useState(false);

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

  // 年月リストを生成
  const yearMonths = Array.from(
    new Set(mockData.map((d) => getYearMonth(d.date)))
  );
  const [selectedYM, setSelectedYM] = useState(yearMonths[0]);

  // 選択年月のデータのみ表示
  const filtered = mockData.filter((d) => getYearMonth(d.date) === selectedYM);

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* ヘッダー */}
      <Header
        showNavigation={true}
        onLogout={handleLogout}
        onHome={() => navigate('/home')}
        userEmail={isAuthChecked ? userEmail : undefined}
        // className="mb-10"
      />
      {/* メイン中央配置 */}
      <main className="flex flex-1 items-center justify-center p-8">
        <div className="bg-white rounded-[16px] shadow p-8 w-full max-w-3xl">
          <h2 className="text-2xl font-bold text-indigo-600 mb-6">勤怠履歴</h2>
          <div className="mb-6 flex items-center gap-4">
            <label className="font-bold text-gray-700">年月:</label>
            <select
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={selectedYM}
              onChange={(e) => setSelectedYM(e.target.value)}
            >
              {yearMonths.map((ym) => (
                <option key={ym} value={ym}>{ym.replace("-", "年") + "月"}</option>
              ))}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-center">
              <thead>
                <tr className="bg-indigo-600 text-white">
                  <th className="py-2 px-4">日付</th>
                  <th className="py-2 px-4">出勤</th>
                  <th className="py-2 px-4">退勤</th>
                  <th className="py-2 px-4">勤務時間</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-gray-400">データがありません</td>
                  </tr>
                ) : (
                  filtered.map((row, idx) => (
                    <tr key={row.date} className={idx % 2 ? "bg-gray-50" : ""}>
                      <td className="py-2 px-4">{row.date}</td>
                      <td className="py-2 px-4">{row.start}</td>
                      <td className="py-2 px-4">{row.end}</td>
                      <td className="py-2 px-4">{row.work}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default History; 