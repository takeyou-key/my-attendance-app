/**
 * 時間計算ユーティリティ
 * 勤務時間、実働時間、残業時間の計算を行う共通関数群
 * 
 * 主な機能:
 * - 総勤務時間の計算
 * - 実働時間の計算（休憩時間を除く）
 * - 残業時間の計算
 * - 時間の合計計算
 * 
 * 制限事項:
 * - 時間形式は "HH:MM" 形式のみ対応
 * - 無効な値は "--:--" を返す
 */

/**
 * 総勤務時間を計算する
 * @param {string} clockIn - 出勤時刻 ("HH:MM"形式)
 * @param {string} clockOut - 退勤時刻 ("HH:MM"形式)
 * @returns {string} 勤務時間 ("HH:MM"形式、無効な場合は "--:--")
 */
export const calculateWorkTime = (clockIn, clockOut) => {
  if (!clockIn || !clockOut || clockIn === "--:--" || clockOut === "--:--") {
    return "--:--";
  }
  
  try {
    const [inHour, inMin] = clockIn.split(":").map(Number);
    const [outHour, outMin] = clockOut.split(":").map(Number);
    
    const inMinutes = inHour * 60 + inMin;
    const outMinutes = outHour * 60 + outMin;
    
    if (outMinutes <= inMinutes) {
      return "--:--"; // 退勤時刻が出勤時刻より早い場合
    }
    
    const workMinutes = outMinutes - inMinutes;
    const hours = Math.floor(workMinutes / 60);
    const minutes = workMinutes % 60;
    
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  } catch {
    return "--:--";
  }
};

/**
 * 実働時間を計算する（総勤務時間 - 休憩時間）
 * @param {string} workTime - 総勤務時間 ("HH:MM"形式)
 * @param {string} breakTime - 休憩時間 ("HH:MM"形式)
 * @returns {string} 実働時間 ("HH:MM"形式、無効な場合は "--:--")
 */
export const calculateActualWorkTime = (workTime, breakTime) => {
  if (!workTime || workTime === "--:--") {
    return "--:--";
  }
  
  try {
    const [workHours, workMinutes] = workTime.split(":").map(Number);
    const totalWorkMinutes = workHours * 60 + workMinutes;
    
    let breakMinutes = 0;
    if (breakTime && breakTime !== "--:--") {
      const [breakHours, breakMins] = breakTime.split(":").map(Number);
      breakMinutes = breakHours * 60 + breakMins;
    }
    
    const actualWorkMinutes = totalWorkMinutes - breakMinutes;
    
    if (actualWorkMinutes <= 0) {
      return "--:--";
    }
    
    const hours = Math.floor(actualWorkMinutes / 60);
    const minutes = actualWorkMinutes % 60;
    
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  } catch {
    return "--:--";
  }
};

/**
 * 残業時間を計算する（実働時間ベース）
 * @param {string} actualWorkTime - 実働時間 ("HH:MM"形式)
 * @param {number} regularWorkMinutes - 定時時間（分）
 * @returns {string} 残業時間 ("HH:MM"形式、定時以内の場合は "--:--")
 */
export const calculateOverTime = (actualWorkTime, regularWorkMinutes) => {
  if (!actualWorkTime || actualWorkTime === "--:--") {
    return "--:--";
  }
  
  try {
    const [hours, minutes] = actualWorkTime.split(":").map(Number);
    const totalWorkMinutes = hours * 60 + minutes;
    
    if (totalWorkMinutes <= regularWorkMinutes) {
      return "--:--"; // 定時以内
    }
    
    const overTimeMinutes = totalWorkMinutes - regularWorkMinutes;
    const overHours = Math.floor(overTimeMinutes / 60);
    const overMinutes = overTimeMinutes % 60;
    
    return `${String(overHours).padStart(2, "0")}:${String(overMinutes).padStart(2, "0")}`;
  } catch {
    return "--:--";
  }
};

/**
 * 時間の合計を計算する
 * @param {string[]} times - 時間の配列 ("HH:MM"形式)
 * @returns {string} 合計時間 ("HH:MM"形式、無効な場合は "--:--")
 */
export const sumTimes = (times) => {
  let total = 0;
  let validCount = 0;
  
  times.forEach(t => {
    if (!t || t === "--:--") return;
    const [h, m] = t.split(":").map(Number);
    if (!isNaN(h) && !isNaN(m)) {
      total += h * 60 + m;
      validCount++;
    }
  });
  
  if (validCount === 0) return "--:--";
  
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}; 