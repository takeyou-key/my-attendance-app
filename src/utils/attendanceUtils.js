/**
 * 勤怠データ取得ユーティリティ
 * Firestoreからのデータ取得処理を統一する
 * 
 * 主な機能:
 * - 今日の勤怠データ取得
 * - 月別勤怠データ取得
 * - 設定データ取得
 * - 申請データ取得
 * 
 * 制限事項:
 * - Firebase Firestoreが必要
 * - 認証済みユーザーが必要
 */

import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase.js';
import { COLLECTIONS, generateDocId } from '../constants/firestore.js';

/**
 * 今日の勤怠データを取得する
 * @param {string} userId - ユーザーID
 * @returns {Promise<Object|null>} 勤怠データ（存在しない場合はnull）
 */
export const fetchTodayAttendance = async (userId) => {
  try {
    const today = new Date();
    // 日本時間で日付を取得
    const dateStr = today.toLocaleDateString('ja-JP', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    }).replace(/\//g, '-');
    const docRef = doc(db, COLLECTIONS.TIME_RECORDS, generateDocId.timeRecord(userId, dateStr));
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error('今日の勤怠データ取得エラー:', error);
    throw error;
  }
};

/**
 * 月別勤怠データを取得する
 * @param {string} userId - ユーザーID
 * @returns {Promise<Array>} 勤怠データの配列
 */
export const fetchMonthlyAttendance = async (userId) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.TIME_RECORDS),
      where("userId", "==", userId)
    );
    const querySnapshot = await getDocs(q);
    const data = [];
    
    querySnapshot.forEach((doc) => {
      data.push(doc.data());
    });
    
    return data;
  } catch (error) {
    console.error('月別勤怠データ取得エラー:', error);
    throw error;
  }
};


/**
 * 申請データを取得する
 * @param {string} userId - ユーザーID（オプション）
 * @returns {Promise<Array>} 申請データの配列
 */
export const fetchApplications = async (userId = null) => {
  try {
    let q;
    if (userId) {
      q = query(
        collection(db, COLLECTIONS.CHANGE_REQUESTS),
        where("userId", "==", userId)
      );
    } else {
      q = query(collection(db, COLLECTIONS.CHANGE_REQUESTS));
    }
    
    const querySnapshot = await getDocs(q);
    const data = [];
    
    querySnapshot.forEach((doc) => {
      data.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return data;
  } catch (error) {
    console.error('申請データ取得エラー:', error);
    throw error;
  }
};

/**
 * 年月リストを生成する
 * @param {Array} attendanceData - 勤怠データの配列
 * @returns {Array} 年月の配列（降順）
 */
export const generateYearMonths = (attendanceData) => {
  const ymSet = new Set();
  
  attendanceData.forEach((data) => {
    if (data.date) {
      const d = new Date(data.date);
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      ymSet.add(yearMonth);
    }
  });
  
  return Array.from(ymSet).sort().reverse();
};

/**
 * 指定年月の勤怠データを取得する
 * @param {Array} attendanceData - 勤怠データの配列
 * @param {string} yearMonth - 年月（YYYY-MM形式）
 * @returns {Array} 指定年月の勤怠データ
 */
export const filterAttendanceByMonth = (attendanceData, yearMonth) => {
  return attendanceData.filter((data) => {
    if (!data.date) return false;
    const d = new Date(data.date);
    const dataYearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return dataYearMonth === yearMonth;
  });
}; 