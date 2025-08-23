/**
 * 設定ページ
 * ユーザーが定時時間を設定できるページ
 * 
 * 主な機能:
 * - 定時時間の設定（時間・分）
 * - Firestoreへの設定保存
 * - 設定の読み込みと表示
 * 
 * 制限事項:
 * - ログイン必須
 * - 個人設定のみ（他のユーザーとは共有されない）
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import Header from '../components/Header.jsx';
import Button from '../components/Button.jsx';
import AuthGuard from '../components/AuthGuard.jsx';
import FormInput from '../components/FormInput.jsx';
import { COLLECTIONS, generateDocId } from '../constants/firestore.js';

const Settings = () => {
  const [userId, setUserId] = useState(null);
  const [regularWorkHours, setRegularWorkHours] = useState(8);
  const [regularWorkMinutes, setRegularWorkMinutes] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const navigate = useNavigate();

  // 認証状態変更時のコールバック
  const handleAuthStateChange = (user) => {
    if (user) {
      setUserId(user.uid);
    } else {
      setUserId(null);
    }
  };

  // 設定データを読み込み
  useEffect(() => {
    if (!userId) return;

    const loadSettings = async () => {
      try {
        const settingsRef = doc(db, COLLECTIONS.USER_SETTINGS, generateDocId.userSetting(userId));
        const settingsSnap = await getDoc(settingsRef);
        
        if (settingsSnap.exists()) {
          const data = settingsSnap.data();
          setRegularWorkHours(data.regularWorkHours || 8);
          setRegularWorkMinutes(data.regularWorkMinutes || 0);
        }
      } catch (error) {
        console.error("設定読み込みエラー:", error);
        setSaveStatus('設定の読み込みに失敗しました');
      }
    };

    loadSettings();
  }, [userId]);

  // 設定を保存
  const handleSave = async () => {
    if (!userId) return;

    setIsLoading(true);
    setSaveStatus('');

    try {
              const settingsRef = doc(db, COLLECTIONS.USER_SETTINGS, generateDocId.userSetting(userId));
      await setDoc(settingsRef, {
        regularWorkHours: regularWorkHours,
        regularWorkMinutes: regularWorkMinutes,
        updatedAt: new Date()
      });

      setSaveStatus('設定を保存しました');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error("設定保存エラー:", error);
      setSaveStatus('設定の保存に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthGuard onAuthStateChange={handleAuthStateChange}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">設定</h1>
            
            <div className="space-y-6">
              {/* 定時設定 */}
              <div className="border-b pb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">定時設定</h2>
                <p className="text-sm text-gray-600 mb-4">
                  定時時間を設定してください。この時間を超えた勤務時間は残業時間として計算されます。
                </p>
                
                                 <div className="flex items-center space-x-4">
                   <div className="flex-1">
                     <FormInput
                       type="select"
                       label="時間"
                       id="regularWorkHours"
                       name="regularWorkHours"
                       value={regularWorkHours}
                       onChange={(e) => setRegularWorkHours(Number(e.target.value))}
                       options={Array.from({ length: 13 }, (_, i) => ({ value: i, label: `${i}時間` }))}
                     />
                   </div>
                   
                   <div className="flex-1">
                     <FormInput
                       type="select"
                       label="分"
                       id="regularWorkMinutes"
                       name="regularWorkMinutes"
                       value={regularWorkMinutes}
                       onChange={(e) => setRegularWorkMinutes(Number(e.target.value))}
                       options={Array.from({ length: 12 }, (_, i) => ({ value: i * 5, label: `${i * 5}分` }))}
                     />
                   </div>
                 </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-800">
                    設定時間: <span className="font-semibold">{regularWorkHours}時間{regularWorkMinutes}分</span>
                  </p>
                </div>
              </div>
              
              {/* ボタン群 */}
              <div className="flex justify-end space-x-4 pt-6">
                <Button
                  onClick={() => navigate('/home')}
                  variant="secondary"
                  className="px-6 py-2"
                >
                  キャンセル
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                >
                  {isLoading ? '保存中...' : '保存'}
                </Button>
              </div>
              
              {/* 保存ステータス */}
              {saveStatus && (
                <div className={`mt-4 p-3 rounded-md ${
                  saveStatus.includes('失敗') 
                    ? 'bg-red-50 text-red-800' 
                    : 'bg-green-50 text-green-800'
                }`}>
                  {saveStatus}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Settings; 