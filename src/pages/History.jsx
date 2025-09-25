import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from '../components/Button.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import Modal from '../components/Modal.jsx';
import { useEffect } from "react";
import { doc, addDoc, setDoc, collection } from "firebase/firestore";
import { db } from "../firebase.js";
import { useAuth } from "../hooks/useAuth.js";
import { calculateWorkTime, calculateActualWorkTime, calculateOverTime, sumTimes } from '../utils/timeCalculations.js';
import { fetchMonthlyAttendance, generateYearMonths } from '../utils/attendanceUtils.js';
import { COLLECTIONS, generateDocId } from '../constants/firestore.js';
import Tutorial from '../components/Tutorial.jsx';
/**
 * 実績確認・申請ページコンポーネント
 * 月別の勤務実績を表示し、申請機能を提供
 */
function History() {
  const navigate = useNavigate();
  // 年月リストを生成
  const [selectedYM, setSelectedYM] = useState("");
  const [rows, setRows] = useState([]);
  const [yearMonths, setYearMonths] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [regularWorkMinutes, setRegularWorkMinutes] = useState(480); // デフォルト8時間

  // 認証フックを使用
  const { userId, userEmail, isAuthChecked } = useAuth({
    requireAuth: true,
    redirectTo: '/login'
  });

  // 設定データを読み込み
  useEffect(() => {
    if (!userId || !isAuthChecked) return;

    // デフォルトの定時時間を8時間に設定
    setRegularWorkMinutes(8 * 60);
  }, [userId, isAuthChecked]);

  // ページフォーカス時にデータを再取得
  useEffect(() => {
    const handleFocus = () => {
      if (userId && isAuthChecked) {
        const fetchData = async () => {
          try {
            const data = await fetchMonthlyAttendance(userId);
            setRows(data);
          } catch (error) {
            console.error("データ再取得エラー:", error);
          }
        };
        fetchData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [userId, isAuthChecked]);

  // Firestoreからデータ取得
  useEffect(() => {
    if (!userId || !isAuthChecked) {
      setRows([]);
      setYearMonths([]);
      setIsDataLoaded(false);
      return;
    }

    const fetchData = async () => {
      try {
        const data = await fetchMonthlyAttendance(userId);
        const ymArr = generateYearMonths(data);
        setYearMonths(ymArr);
        setRows(data);
        if (!selectedYM && ymArr.length > 0) setSelectedYM(ymArr[0]);
        setIsDataLoaded(true);
      } catch (error) {
        console.error("データ取得エラー:", error);
        setIsDataLoaded(true);
      }
    };

    fetchData();
  }, [userId, isAuthChecked, selectedYM]);

  // 時間計算関数は utils/timeCalculations.js からインポート

  // 選択年月の全日のテーブルを生成
  const generateMonthTable = (yearMonth) => {
    if (!yearMonth) return [];

    const [year, month] = yearMonth.split("-").map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const table = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const existingData = rows.find((d) => d.date === dateStr);

      // 勤務時間と残業時間を計算
      const clockIn = existingData?.clockIn || "--:--";
      const clockOut = existingData?.clockOut || "--:--";
      const breakTime = existingData?.breakTime || "01:00"; // デフォルト1時間
      const workTime = calculateWorkTime(clockIn, clockOut);
      const actualWorkTime = calculateActualWorkTime(workTime, breakTime);
      const overTime = calculateOverTime(actualWorkTime, regularWorkMinutes);

      table.push({
        date: dateStr,
        clockIn: clockIn,
        clockOut: clockOut,
        breakTime: breakTime,
        workTime: workTime,
        actualWorkTime: actualWorkTime,
        overTime: overTime,
        status: existingData?.status || "",
        comment: existingData?.comment || "",
        userId: userId
      });
    }

    return table;
  };

  const monthTable = generateMonthTable(selectedYM);

  // 合計計算関数は utils/timeCalculations.js からインポート

  const sumActualWorkTime = sumTimes(monthTable.map(r => r.actualWorkTime));
  const sumOverTime = sumTimes(monthTable.map(r => r.overTime));
  const sumBreakTime = sumTimes(monthTable.map(r => r.breakTime));

  // デバッグ用：残業時間の計算を確認
  console.log("定時時間（分）:", regularWorkMinutes);
  console.log("残業時間データ:", monthTable.map(r => ({
    date: r.date,
    actualWorkTime: r.actualWorkTime,
    overTime: r.overTime
  })));
  console.log("合計残業時間:", sumOverTime);

  // セル編集ハンドラ
  const handleCellEdit = (date, field, value) => {
    setEditRows(prev => ({
      ...prev,
      [date]: {
        ...prev[date],
        [field]: value
      }
    }));
  };

  // セルダブルクリックで編集モード
  const [editing, setEditing] = useState({ date: null, field: null });

  // 申請ボタン押下時の処理
  const handleApply = () => {
    if (Object.keys(editRows).length === 0) {
      // joyrideが実行中でない場合のみモーダルを表示
      if (!document.querySelector('.react-joyride__overlay')) {
        setShowNoDataModal(true);
      }
      return;
    }
    setShowCommentModal(true);
  };

  // コメント入力後の申請処理
  const handleSubmitApplication = async () => {
    try {
      // 編集された行だけFirestoreに保存
      for (const date in editRows) {
        const docRef = doc(db, COLLECTIONS.TIME_RECORDS, generateDocId.timeRecord(userId, date));
        const originalData = rows.find(r => r.date === date) || {};

        // 元のデータと編集されたデータをマージ
        const updatedData = {
          userId,
          date,
          clockIn: editRows[date].clockIn || originalData.clockIn || "--:--",
          clockOut: editRows[date].clockOut || originalData.clockOut || "--:--",
          breakTime: editRows[date].breakTime || originalData.breakTime || "01:00",
          status: "申請中"
        };

        await setDoc(docRef, updatedData, { merge: true });

        // 元のデータを取得（申請データ用）
        const originalDataForRequest = rows.find(r => r.date === date) || {};

        // 管理者の未対応タブに表示するため、requestsコレクションにも保存
        const requestData = {
          item: "勤怠修正申請",
          date: new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }),
          applicant: userEmail || "ユーザー",
          targetDate: new Date(date).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }),
          details: `出勤: ${editRows[date].clockIn || '--:--'}, 退勤: ${editRows[date].clockOut || '--:--'}, 休憩: ${editRows[date].breakTime || '--:--'}`,
          status: "未対応",
          userId: userId,
          attendanceDate: date,
          comment: comment, // コメントを追加
          // 変更前後のデータを保存
          originalData: {
            clockIn: originalDataForRequest.clockIn || '--:--',
            clockOut: originalDataForRequest.clockOut || '--:--',
            breakTime: originalDataForRequest.breakTime || '--:--',
            workTime: originalDataForRequest.workTime || '--:--',
            overTime: originalDataForRequest.overTime || '--:--'
          },
          updatedData: {
            clockIn: editRows[date].clockIn || originalDataForRequest.clockIn || '--:--',
            clockOut: editRows[date].clockOut || originalDataForRequest.clockOut || '--:--',
            breakTime: editRows[date].breakTime || originalDataForRequest.breakTime || '01:00'
          }
        };

        await addDoc(collection(db, COLLECTIONS.CHANGE_REQUESTS), requestData);
      }

      // ローカルデータを更新
      const newRows = [...rows];
      for (const date in editRows) {
        const existingIdx = newRows.findIndex(r => r.date === date);
        const originalData = rows.find(r => r.date === date) || {};

        // 元のデータと編集されたデータをマージ
        const newData = {
          userId,
          date,
          clockIn: editRows[date].clockIn || originalData.clockIn || "--:--",
          clockOut: editRows[date].clockOut || originalData.clockOut || "--:--",
          breakTime: editRows[date].breakTime || originalData.breakTime || "01:00",
          status: "申請中"
        };

        if (existingIdx !== -1) {
          newRows[existingIdx] = { ...newRows[existingIdx], ...newData };
        } else {
          newRows.push(newData);
        }
      }

      setRows(newRows);
      setEditRows({});
      setEditing({ date: null, field: null });
      setShowCommentModal(false);
      setComment("");
      setShowSuccessModal(true);
      // 申請後にrequestlistページに遷移
      navigate('/home/requestlist');
    } catch (error) {
      console.error("申請エラー:", error);
      setShowErrorModal(true);
    }
  };

  // モーダルをキャンセル
  const handleCancelModal = () => {
    setShowCommentModal(false);
    setComment("");
  };

  const [editRows, setEditRows] = useState({}); // {date: {clockIn, clockOut}}
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showNoDataModal, setShowNoDataModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [comment, setComment] = useState("");

  // 認証状態とデータの読み込みが完了するまでローディング表示
  if (!isAuthChecked || !isDataLoaded) {
    return <LoadingSpinner fullScreen={true} />;
  }

  return (
    <div className="w-full h-full p-4 pb-24 md:p-6 md:pb-28 lg:pb-8">
      <div className="max-w-6xl mx-auto h-full flex flex-col">
        <div className="mb-4 md:mb-6 flex flex-col space-y-3">
          {/* 1行目：年月選択と申請ボタン */}
          <div className="flex items-center justify-between">
            <div>
              <label className="font-bold text-gray-700">年月 :  </label>
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
            <Button
              onClick={handleApply}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl step3 openModalBtn"
            >
              申請
            </Button>
          </div>

          {/* 2行目：ステータス色分け説明 */}
          <div className="flex items-center space-x-2 text-sm">
            <span className="font-medium text-gray-700">ステータス：</span>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">申請中</span>
              <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs">否認</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">承認済み</span>
            </div>
          </div>
        </div>

        {/* チュートリアル - ボタンのみ右寄せ */}
        <div className="flex justify-end mb-2">
          <Tutorial />
        </div>

        {/* テーブルコンテナ - 固定高さでスクロール */}
        <div className="bg-white shadow overflow-hidden" style={{
          height: "calc(100vh - 200px - 3.5rem)"
        }}>
          <div className="overflow-auto bg-white h-full">
            <table className="min-w-full border text-center whitespace-nowrap">
              <thead className="sticky top-0 z-10 bg-indigo-600 shadow-sm backdrop-blur-sm">
                <tr className="bg-indigo-600 text-white">
                  <th className="py-2 px-4 whitespace-nowrap">日付</th>
                  <th className="py-2 px-4 whitespace-nowrap ">出勤時刻</th>
                  <th className="py-2 px-4 whitespace-nowrap ">退勤時刻</th>
                  <th className="py-2 px-4 whitespace-nowrap ">休憩時間</th>
                  <th className="py-2 px-4 whitespace-nowrap">勤務時間</th>
                  <th className="py-2 px-4 whitespace-nowrap">残業時間</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {monthTable.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-4 text-gray-400">データがありません</td>
                  </tr>
                ) : (
                  monthTable.map((row, idx) => (
                    <tr key={row.date} className={
                      `${idx % 2 ? "bg-gray-50" : ""} ${row.status === "申請中" || row.status === "未対応"
                        ? "bg-red-100"
                        : row.status === "否認"
                          ? "bg-yellow-200"
                          : row.status === "承認済み"
                            ? "bg-green-100"
                            : ""
                        }`.trim()
                    }>
                      <td className="py-2 px-4">{new Date(row.date).getDate()}</td>
                      {/* 出勤時刻セル */}
                      <td
                        className="py-2 px-4 cursor-pointer step1 step2"
                        onDoubleClick={() => setEditing({ date: row.date, field: "clockIn" })}
                      >
                        {editing.date === row.date && editing.field === "clockIn" ? (
                          <input
                            type="time"
                            value={editRows[row.date]?.clockIn ?? row.clockIn ?? "--:--"}
                            onChange={e => handleCellEdit(row.date, "clockIn", e.target.value)}
                            onBlur={() => setEditing({ date: null, field: null })}
                            onKeyDown={e => { if (e.key === "Enter") setEditing({ date: null, field: null }); }}
                            className="border rounded px-2 py-1 w-24"
                            autoFocus
                          />
                        ) : (
                          editRows[row.date]?.clockIn ?? row.clockIn ?? "--:--"
                        )}
                      </td>
                      {/* 退勤時刻セル */}
                      <td
                        className="py-2 px-4 cursor-pointer"
                        onDoubleClick={() => setEditing({ date: row.date, field: "clockOut" })}
                      >
                        {editing.date === row.date && editing.field === "clockOut" ? (
                          <input
                            type="time"
                            value={editRows[row.date]?.clockOut ?? row.clockOut ?? "--:--"}
                            onChange={e => handleCellEdit(row.date, "clockOut", e.target.value)}
                            onBlur={() => setEditing({ date: null, field: null })}
                            onKeyDown={e => { if (e.key === "Enter") setEditing({ date: null, field: null }); }}
                            className="border rounded px-2 py-1 w-24"
                            autoFocus
                          />
                        ) : (
                          editRows[row.date]?.clockOut ?? row.clockOut ?? "--:--"
                        )}
                      </td>
                      <td
                        className="py-2 px-4 cursor-pointer"
                        onDoubleClick={() => setEditing({ date: row.date, field: "breakTime" })}
                      >
                        {editing.date === row.date && editing.field === "breakTime" ? (
                          <input
                            type="time"
                            value={editRows[row.date]?.breakTime ?? row.breakTime ?? "--:--"}
                            onChange={e => handleCellEdit(row.date, "breakTime", e.target.value)}
                            onBlur={() => setEditing({ date: null, field: null })}
                            onKeyDown={e => { if (e.key === "Enter") setEditing({ date: null, field: null }); }}
                            className="border rounded px-2 py-1 w-24"
                            autoFocus
                          />
                        ) : (
                          editRows[row.date]?.breakTime ?? row.breakTime ?? "--:--"
                        )}
                      </td>
                      <td className="py-2 px-4">{row.actualWorkTime || "--:--"}</td>
                      <td className="py-2 px-4">{row.overTime || "--:--"}</td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="sticky bottom-0 z-10 bg-gray-200 shadow-lg backdrop-blur-sm">
                <tr className="font-bold bg-gray-200 shadow-lg">
                  <td className="py-2 px-4 whitespace-nowrap bg-gray-200">合計</td>
                  <td className="py-2 px-4 whitespace-nowrap bg-gray-200">--:--</td>
                  <td className="py-2 px-4 whitespace-nowrap bg-gray-200">--:--</td>
                  <td className="py-2 px-4 whitespace-nowrap bg-gray-200">{sumBreakTime}</td>
                  <td className="py-2 px-4 whitespace-nowrap bg-gray-200">{sumActualWorkTime}</td>
                  <td className="py-2 px-4 whitespace-nowrap bg-gray-200">{sumOverTime}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* コメント入力モーダル */}
      <Modal
        isOpen={showCommentModal}
        onClose={handleCancelModal}
        size="md"
        showCloseButton={false}
      >
        <h3 className="text-lg font-bold mb-4">申請コメント</h3>
        <p className="text-sm text-gray-600 mb-4">
          申請理由や修正内容についてコメントを入力してください。
        </p>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="申請理由を入力してください..."
          className="w-full h-24 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 step4"
        />
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={handleCancelModal}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmitApplication}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 step5"
          >
            申請する
          </button>
        </div>
      </Modal>

      {/* 申請データなしモーダル */}
      <Modal
        isOpen={showNoDataModal}
        onClose={() => setShowNoDataModal(false)}
        size="sm"
        showCloseButton={false}
        className="text-center"
      >
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-4">⚠️</div>
          <h3 className="text-lg font-bold mb-4">申請する内容がありません</h3>
          <p className="text-sm text-gray-600 mb-6">
            修正したい項目をダブルクリックして編集してから申請してください。
          </p>
          <Button
            onClick={() => setShowNoDataModal(false)}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
          >
            閉じる
          </Button>
        </div>
      </Modal>

      {/* 申請成功モーダル */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        size="sm"
        showCloseButton={false}
        className="text-center"
      >
        <div className="text-center">
          <div className="text-green-500 text-2xl mb-4">✅</div>
          <h3 className="text-lg font-bold mb-4">申請完了</h3>
          <p className="text-sm text-gray-600 mb-6">
            申請しました。管理者が確認します。
          </p>
          <Button
            onClick={() => setShowSuccessModal(false)}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl"
          >
            閉じる
          </Button>
        </div>
      </Modal>

      {/* 申請エラーモーダル */}
      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        size="sm"
        showCloseButton={false}
        className="text-center"
      >
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-4">❌</div>
          <h3 className="text-lg font-bold mb-4">申請に失敗しました</h3>
          <p className="text-sm text-gray-600 mb-6">
            ネットワーク接続を確認して、再度お試しください。
          </p>
          <Button
            onClick={() => setShowErrorModal(false)}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            閉じる
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default History; 