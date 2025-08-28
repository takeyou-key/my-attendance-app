import React, { useState, useEffect } from "react";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import TabNavigation from "../components/TabNavigation.jsx";
import SortableTable from "../components/SortableTable.jsx";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { COLLECTIONS } from "../constants/firestore.js";

/**
 * 申請一覧画面コンポーネント
 * 申請中の申請と対応済みの申請をタブで切り替えて表示
 */
function RequestList() {
    const [activeTab, setActiveTab] = useState("pending"); // "pending" or "completed"
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);
    const [isAuthChecked, setIsAuthChecked] = useState(false);
    const [searchTerm, setSearchTerm] = useState(""); // 検索キーワード
    const [filterItem, setFilterItem] = useState("all"); // 項目フィルター
    const auth = getAuth();

    // 認証状態の監視
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                setUserId(null);
            }
            setIsAuthChecked(true);
        });

        return () => unsubscribe();
    }, [auth]);

    // Firestoreから申請データを取得
    useEffect(() => {
        if (!userId || !isAuthChecked) {
            setRequests([]);
            setLoading(false);
            return;
        }

        const fetchRequests = async () => {
            try {
                const q = query(
                    collection(db, COLLECTIONS.CHANGE_REQUESTS),
                    where("userId", "==", userId)
                );
                const querySnapshot = await getDocs(q);
                const requestsData = [];
                querySnapshot.forEach((doc) => {
                    requestsData.push({ id: doc.id, ...doc.data() });
                });
                setRequests(requestsData);
                setLoading(false);
            } catch (error) {
                console.error("申請データ取得エラー:", error);
                setLoading(false);
            }
        };

        fetchRequests();
    }, [userId, isAuthChecked]);

    // タブに応じてデータをフィルタリング
    const filteredRequests = requests.filter(request => {
        if (activeTab === "pending") {
            return request.status === "未対応";
        } else if (activeTab === "completed") {
            return request.status === "承認" || request.status === "否認";
        }
        return false;
    });

      // カラム定義
  const columns = [
    { key: "item", label: "申請項目", sortable: true },
    { key: "date", label: "申請日", sortable: true },
    { key: "targetDate", label: "対象日", sortable: true },
    { key: "originalData", label: "変更前", sortable: false },
    { key: "updatedData", label: "変更後", sortable: false },
    { key: "comment", label: "コメント", sortable: false },
    { key: "status", label: "ステータス", sortable: true }
  ];

    // フィルターオプション
    const filterOptions = [
        { value: "勤怠修正申請", label: "勤怠修正申請" }
        // { value: "有給休暇申請", label: "有給休暇申請" },
        // { value: "残業申請", label: "残業申請" },
        // { value: "遅刻申請", label: "遅刻申請" }
    ];

    // 行レンダリング関数
    const renderRow = (request) => (
        <>
            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                {request.item}
            </td>
            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                {request.date}
            </td>
            
            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                {request.targetDate}
            </td>
            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                {request.originalData ? (
                    <div className="text-xs">
                        <div className="mb-1">
                            <span className="font-medium text-gray-600">出勤:</span> 
                            <span className={`ml-1 ${request.originalData.clockIn !== request.updatedData?.clockIn ? 'line-through text-red-500' : ''}`}>
                                {request.originalData.clockIn}
                            </span>
                        </div>
                        <div className="mb-1">
                            <span className="font-medium text-gray-600">退勤:</span> 
                            <span className={`ml-1 ${request.originalData.clockOut !== request.updatedData?.clockOut ? 'line-through text-red-500' : ''}`}>
                                {request.originalData.clockOut}
                            </span>
                        </div>
                        <div>
                            <span className="font-medium text-gray-600">休憩:</span> 
                            <span className={`ml-1 ${request.originalData.breakTime !== request.updatedData?.breakTime ? 'line-through text-red-500' : ''}`}>
                                {request.originalData.breakTime}
                            </span>
                        </div>
                    </div>
                ) : (
                    <span className="text-gray-400">--</span>
                )}
            </td>
            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">
                {request.updatedData ? (
                    <div className="text-xs">
                        <div className="mb-1">
                            <span className="font-medium text-grey-600">出勤:</span> 
                            <span className={`ml-1 ${request.originalData?.clockIn !== request.updatedData.clockIn ? 'text-green-600 font-bold' : ''}`}>
                                {request.updatedData.clockIn}
                            </span>
                        </div>
                        <div className="mb-1">
                            <span className="font-medium text-grey-600">退勤:</span> 
                            <span className={`ml-1 ${request.originalData?.clockOut !== request.updatedData.clockOut ? 'text-green-600 font-bold' : ''}`}>
                                {request.updatedData.clockOut}
                            </span>
                        </div>
                        <div>
                            <span className="font-medium text-grey-600">休憩:</span> 
                            <span className={`ml-1 ${request.originalData?.breakTime !== request.updatedData.breakTime ? 'text-green-600 font-bold' : ''}`}>
                                {request.updatedData.breakTime}
                            </span>
                        </div>
                    </div>
                ) : (
                    <span className="text-gray-400">--</span>
                )}
            </td>
            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                {request.comment || "コメントなし"}
            </td>
            <td className="px-6 py-3 whitespace-nowrap text-sm">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    request.status === "承認"
                        ? "bg-green-100 text-green-800"
                        : request.status === "否認"
                        ? "bg-orange-100 text-orange-800"
                        : request.status === "未対応"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                }`}>
                    {request.status}
                </span>
            </td>
        </>
    );

    if (loading || !isAuthChecked) {
        return <LoadingSpinner fullScreen={true} />;
    }

  return (
    <div className="bg-gray-100">
      {/* メインコンテンツ */}
      <main className="p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          {/* タイトル */}
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4">申請一覧</h1>

          {/* タブ */}
          <TabNavigation
            tabs={[
              { id: "pending", label: "申請中" },
              { id: "completed", label: "対応済み" }
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            variant="underline"
          />

          {/* デスクトップ用テーブル */}
          <div className="hidden lg:block">
            <SortableTable
              data={filteredRequests}
              columns={columns}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filterValue={filterItem}
              onFilterChange={setFilterItem}
              filterOptions={filterOptions}
              filterLabel="項目"
              searchPlaceholder="申請日、申請者名、対象日"
              renderRow={renderRow}
            />
          </div>

          {/* モバイル・タブレット用カード表示 */}
          <div className="lg:hidden space-y-4">
            {filteredRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-md p-3 md:p-4 border">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-gray-900">{request.item}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    request.status === "承認"
                      ? "bg-green-100 text-green-800"
                      : request.status === "否認"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {request.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-gray-600">申請日:</span>
                    <span className="ml-1 font-medium">{request.date}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">対象日:</span>
                    <span className="ml-1 font-medium">{request.targetDate}</span>
                  </div>
                </div>

                {/* 変更内容 */}
                {request.originalData && request.updatedData && (
                  <div className="bg-gray-50 rounded p-3 mb-3">
                    <h4 className="font-medium text-gray-700 mb-2">変更内容</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span>出勤:</span>
                        <div className="flex space-x-2">
                          <span className={request.originalData.clockIn !== request.updatedData.clockIn ? 'line-through text-red-500' : ''}>
                            {request.originalData.clockIn}
                          </span>
                          <span>→</span>
                          <span className={request.originalData.clockIn !== request.updatedData.clockIn ? 'text-green-600 font-bold' : ''}>
                            {request.updatedData.clockIn}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span>退勤:</span>
                        <div className="flex space-x-2">
                          <span className={request.originalData.clockOut !== request.updatedData.clockOut ? 'line-through text-red-500' : ''}>
                            {request.originalData.clockOut}
                          </span>
                          <span>→</span>
                          <span className={request.originalData.clockOut !== request.updatedData.clockOut ? 'text-green-600 font-bold' : ''}>
                            {request.updatedData.clockOut}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* コメント */}
                <div className="mb-3">
                  <span className="text-gray-600 text-sm">コメント:</span>
                  <p className="text-sm mt-1">{request.comment || "コメントなし"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default RequestList;