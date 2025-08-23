/**
 * 打刻処理カスタムフック
 * 出勤・退勤の打刻処理を統一する
 * 
 * 主な機能:
 * - 出勤打刻処理
 * - 退勤打刻処理
 * - 今日の打刻状況取得
 * - 打刻完了メッセージ管理
 * 
 * 制限事項:
 * - Firebase Firestoreが必要
 * - 認証済みユーザーが必要
 */

import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { calculateWorkTime } from '../utils/timeCalculations.js';
import { COLLECTIONS, generateDocId } from '../constants/firestore.js';

/**
 * 打刻処理フック
 * @param {string} userId - ユーザーID
 * @param {boolean} isAuthChecked - 認証チェック完了フラグ
 * @returns {Object} 打刻関連の状態と関数
 */
export const useClock = (userId, isAuthChecked) => {
  const [todayStatus, setTodayStatus] = useState({
    出勤: "--:--",
    退勤: "--:--"
  });
  const [completeMessage, setCompleteMessage] = useState("");
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // 今日の出勤・退勤状況を取得
  useEffect(() => {
    if (!userId || !isAuthChecked) {
      setTodayStatus({ 出勤: "--:--", 退勤: "--:--" });
      setIsDataLoaded(false);
      return;
    }

    const fetchToday = async () => {
      try {
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10);
        const docRef = doc(db, COLLECTIONS.TIME_RECORDS, generateDocId.timeRecord(userId, dateStr));
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
      } catch (error) {
        console.error('打刻状況取得エラー:', error);
        setTodayStatus({ 出勤: "--:--", 退勤: "--:--" });
        setIsDataLoaded(true);
      }
    };

    fetchToday();
  }, [userId, isAuthChecked]);

  // 出勤打刻
  const handleClockIn = async () => {
    if (!userId) return;

    try {
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10);
      const timeStr = today.toTimeString().slice(0, 5);
      const docRef = doc(db, COLLECTIONS.TIME_RECORDS, generateDocId.timeRecord(userId, dateStr));

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

      // データを再取得して状態を同期
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTodayStatus({
          出勤: data.clockIn || "--:--",
          退勤: data.clockOut || "--:--"
        });
      }
    } catch (error) {
      console.error('出勤打刻エラー:', error);
      setCompleteMessage("出勤打刻に失敗しました。");
      setTimeout(() => setCompleteMessage(""), 3000);
    }
  };

  // 退勤打刻
  const handleClockOut = async () => {
    if (!userId) return;

    try {
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10);
      const timeStr = today.toTimeString().slice(0, 5);
      const docRef = doc(db, COLLECTIONS.TIME_RECORDS, generateDocId.timeRecord(userId, dateStr));
      
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const start = data.clockIn;
        const end = timeStr;
        
        if (start && start !== "--:--") {
          // 勤務時間を計算
          const workTime = calculateWorkTime(start, end);
          
          await updateDoc(docRef, {
            clockOut: end,
            workTime
          });

          setCompleteMessage("退勤の打刻が完了しました。お疲れさまでした！\nログアウトしますか？");
          setTodayStatus((prev) => ({ ...prev, 退勤: end }));

          // データを再取得して状態を同期
          const updatedDocSnap = await getDoc(docRef);
          if (updatedDocSnap.exists()) {
            const updatedData = updatedDocSnap.data();
            setTodayStatus({
              出勤: updatedData.clockIn || "--:--",
              退勤: updatedData.clockOut || "--:--"
            });
          }
        }
      }
    } catch (error) {
      console.error('退勤打刻エラー:', error);
      setCompleteMessage("退勤打刻に失敗しました。");
      setTimeout(() => setCompleteMessage(""), 3000);
    }
  };

  // 打刻状況をリセット
  const resetTodayStatus = () => {
    setTodayStatus({ 出勤: "--:--", 退勤: "--:--" });
  };

  return {
    todayStatus,
    completeMessage,
    isDataLoaded,
    handleClockIn,
    handleClockOut,
    resetTodayStatus,
    setCompleteMessage
  };
}; 