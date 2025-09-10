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
  //===== 状態管理 =====
  //今日の出勤・退勤時刻を管理する状態
  const [todayStatus, setTodayStatus] = useState({
    出勤: "--:--",
    退勤: "--:--"
  });
  //打刻完了時のメッセージを管理する状態
  const [completeMessage, setCompleteMessage] = useState("");
  //データ読み込み完了フラグ
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  //===== 今日の打刻状況取得処理 =====
  useEffect(() => {
    //1. 認証チェック: userIdまたはisAuthCheckedが無い場合は初期化して終了
    if (!userId || !isAuthChecked) {
      setTodayStatus({ 出勤: "--:--", 退勤: "--:--" });
      setIsDataLoaded(false);
      return;
    }

    //2. 今日の打刻データをFirestoreから取得する非同期関数
    const fetchToday = async () => {
      try {
        //3. 現在日時を取得
        const today = new Date();
        
        //4. 日本時間で日付文字列を作成 (例: "2024-01-15")
        const dateStr = today.toLocaleDateString('ja-JP', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit' 
        }).replace(/\//g, '-');
        
        //5. Firestoreのドキュメント参照を作成 (例: "time_records/user123_2024-01-15")
        const docRef = doc(db, COLLECTIONS.TIME_RECORDS, generateDocId.timeRecord(userId, dateStr));
        
        //6. Firestoreからドキュメントを取得
        const docSnap = await getDoc(docRef);
        
        //7. ドキュメントが存在する場合の処理
        if (docSnap.exists()) {
          const data = docSnap.data();
          //8. 取得したデータで状態を更新
          setTodayStatus({
            出勤: data.clockIn || "--:--",
            退勤: data.clockOut || "--:--"
          });
        } else {
          //9. ドキュメントが存在しない場合は初期状態を設定
          setTodayStatus({ 出勤: "--:--", 退勤: "--:--" });
        }
        
        //10. データ読み込み完了フラグを立てる
        setIsDataLoaded(true);
      } catch (error) {
        //11. エラー発生時の処理
        console.error('打刻状況取得エラー:', error);
        setTodayStatus({ 出勤: "--:--", 退勤: "--:--" });
        setIsDataLoaded(true);
      }
    };

    //12. 関数を実行
    fetchToday();
  }, [userId, isAuthChecked]); //userIdまたはisAuthCheckedが変更された時に再実行

  //===== 出勤打刻処理 =====
  const handleClockIn = async () => {
    //1. userIdが無い場合は処理を終了
    if (!userId) return;

    try {
      //2. 現在日時を取得
      const today = new Date();
      
      //3. 日本時間で日付文字列を作成 (例: "2024-01-15")
      const dateStr = today.toLocaleDateString('ja-JP', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      }).replace(/\//g, '-');
      
      //4. 現在時刻を文字列で取得 (例: "09:00")
      const timeStr = today.toTimeString().slice(0, 5);
      
      //5. Firestoreのドキュメント参照を作成
      const docRef = doc(db, COLLECTIONS.TIME_RECORDS, generateDocId.timeRecord(userId, dateStr));

      //6. Firestoreに出勤データを保存/更新
      await setDoc(docRef, {
        userId,           //ユーザーID
        date: dateStr,    //日付
        clockIn: timeStr, //出勤時刻
        clockOut: "--:--", //退勤時刻（初期値）
        workTime: "",     //勤務時間（初期値）
        overTime: "",     //残業時間（初期値）
        status: "",       //ステータス（初期値）
        comment: ""       //コメント（初期値）
      }, { merge: true }); //merge: trueで既存データとマージ

      //7. 成功メッセージを表示
      setCompleteMessage("出勤の打刻が完了しました。今日も一日頑張りましょう！");
      setTimeout(() => setCompleteMessage(""), 2000); //2秒後にメッセージを消去
      
      //8. ローカル状態を即座に更新
      setTodayStatus((prev) => ({ ...prev, 出勤: timeStr }));

      //9. Firestoreから最新データを再取得して状態を同期
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTodayStatus({
          出勤: data.clockIn || "--:--",
          退勤: data.clockOut || "--:--"
        });
      }
    } catch (error) {
      //10. エラー発生時の処理
      console.error('出勤打刻エラー:', error);
      setCompleteMessage("出勤打刻に失敗しました。");
      setTimeout(() => setCompleteMessage(""), 3000); //3秒後にメッセージを消去
    }
  };

  //===== 退勤打刻処理 =====
  const handleClockOut = async () => {
    //1. userIdが無い場合は処理を終了
    if (!userId) return;

    try {
      //2. 現在日時を取得
      const today = new Date();
      
      //3. 日本時間で日付文字列を作成 (例: "2024-01-15")
      const dateStr = today.toLocaleDateString('ja-JP', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      }).replace(/\//g, '-');
      
      //4. 現在時刻を文字列で取得 (例: "18:00")
      const timeStr = today.toTimeString().slice(0, 5);
      
      //5. Firestoreのドキュメント参照を作成
      const docRef = doc(db, COLLECTIONS.TIME_RECORDS, generateDocId.timeRecord(userId, dateStr));
      
      //6. 既存の打刻データを取得
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const start = data.clockIn;  //出勤時刻
        const end = timeStr;         //退勤時刻
        
        //7. 出勤時刻が存在する場合のみ退勤処理を実行
        if (start && start !== "--:--") {
          //8. 勤務時間を計算 (出勤時刻から退勤時刻まで)
          const workTime = calculateWorkTime(start, end);
          
          //9. Firestoreの退勤データを更新
          await updateDoc(docRef, {
            clockOut: end,    //退勤時刻を設定
            workTime          //計算した勤務時間を設定
          });

          //10. 成功メッセージを表示（ログアウト確認付き）
          setCompleteMessage("退勤の打刻が完了しました。お疲れさまでした！\nログアウトしますか？");
          
          //11. ローカル状態を即座に更新
          setTodayStatus((prev) => ({ ...prev, 退勤: end }));

          //12. Firestoreから最新データを再取得して状態を同期
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
      //13. エラー発生時の処理
      console.error('退勤打刻エラー:', error);
      setCompleteMessage("退勤打刻に失敗しました。");
      setTimeout(() => setCompleteMessage(""), 3000); //3秒後にメッセージを消去
    }
  };

  //===== ユーティリティ関数 =====
  //打刻状況をリセットする関数
  const resetTodayStatus = () => {
    setTodayStatus({ 出勤: "--:--", 退勤: "--:--" });
  };

  //===== フックの戻り値 =====
  //コンポーネントで使用する状態と関数を返す
  return {
    todayStatus,        //今日の出勤・退勤時刻の状態
    completeMessage,    //打刻完了時のメッセージ
    isDataLoaded,       //データ読み込み完了フラグ
    handleClockIn,      //出勤打刻処理関数
    handleClockOut,     //退勤打刻処理関数
    resetTodayStatus,   //打刻状況リセット関数
    setCompleteMessage  //メッセージ設定関数
  };
}; 