import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * ユーザーが管理者かどうかを確認する
 * @param {string} userId - ユーザーID
 * @returns {Promise<boolean>} 管理者の場合はtrue、そうでなければfalse
 */
export const isAdmin = async (userId) => {
  try {
    const userDoc = doc(db, "users", userId);
    const userSnap = await getDoc(userDoc);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      return userData.role === "admin";
    }
    return false;
  } catch (error) {
    console.error("管理者権限確認エラー:", error);
    return false;
  }
};

/**
 * ユーザー情報を取得する
 * @param {string} userId - ユーザーID
 * @returns {Promise<Object|null>} ユーザー情報、存在しない場合はnull
 */
export const getUserInfo = async (userId) => {
  try {
    const userDoc = doc(db, "users", userId);
    const userSnap = await getDoc(userDoc);
    
    if (userSnap.exists()) {
      return userSnap.data();
    }
    return null;
  } catch (error) {
    console.error("ユーザー情報取得エラー:", error);
    return null;
  }
}; 