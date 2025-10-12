import React, { useState, useEffect } from "react";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import TabNavigation from "../components/TabNavigation.jsx";
import SearchFilterTable from "../components/SearchFilterTable.jsx";
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
  const [dateSearchTerm, setDateSearchTerm] = useState(""); // 申請日検索
  const [targetDateSearchTerm, setTargetDateSearchTerm] = useState(""); // 対象日検索
  const [filterItem, setFilterItem] = useState("all"); // 項目フィルター
  const [searchFilteredRequests, setSearchFilteredRequests] = useState([]); // 検索フィルター済みデータ
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

  // タブに応じてデータをフィルタリング（メモ化して配列参照を安定化）
  // ユーザーは最新20件まで表示
  const filteredRequests = React.useMemo(() => {
    const filtered = requests.filter(request => {
      // タブフィルター
      if (activeTab === "pending") {
        if (request.status !== "未対応") return false;
      } else if (activeTab === "completed") {
        if (request.status !== "承認" && request.status !== "否認") return false;
      } else {
        return false;
      }
      return true;
    });
    
    // 最新20件のみ返す
    return filtered.slice(0, 20);
  }, [requests, activeTab]);

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
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${request.status === "承認"
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
    <div className="w-full h-full p-4 pb-24 md:p-6 md:pb-28 lg:pb-8">
      <div className="w-full h-full flex flex-col">
          {/* タイトル */}
          <h1 className="hidden md:block text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4">申請一覧</h1>

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

          {/* デスクトップ用テーブル（高さ拡張はデスクトップのみ）*/}
          <div className={filteredRequests.length > 0 ? "lg:flex-1" : ""}>
            <SearchFilterTable
              data={filteredRequests}
              columns={columns}
              dateSearchTerm={dateSearchTerm}
              onDateSearchChange={setDateSearchTerm}
              targetDateSearchTerm={targetDateSearchTerm}
              onTargetDateSearchChange={setTargetDateSearchTerm}
              filterValue={filterItem}
              onFilterChange={setFilterItem}
              filterOptions={filterOptions}
              filterLabel="申請項目"
              renderRow={renderRow}
              onFilteredDataChange={setSearchFilteredRequests}
              headerBgClass="bg-indigo-600"
              headerHoverBgClass="hover:bg-indigo-700"
              headerTextClass="text-white"
              initialSortField="date"
              initialSortDirection="desc"
            />
          </div>

          {/* モバイル・タブレット用カード表示 */}
          <div className="lg:hidden flex-1 overflow-y-auto">
            {searchFilteredRequests.length > 0 ? (
              <div className="pb-20 space-y-8">
                {Array.from({ length: Math.ceil(searchFilteredRequests.length / 8) }).map((_, groupIndex) => {
                  const startIndex = groupIndex * 8;
                  const endIndex = Math.min(startIndex + 8, searchFilteredRequests.length);
                  const groupRequests = searchFilteredRequests.slice(startIndex, endIndex);
                  
                  return (
                    <div key={`group-${groupIndex}`} className="relative min-h-[400px]">
                      <div className="h-2"></div>
                      {groupRequests.map((request, stackIndex) => (
                        <div 
                          key={request.id} 
                          className="sticky bg-white rounded-lg shadow-lg p-3 border-2 border-gray-200 mb-2 transition-all duration-300"
                          style={{
                            top: `${10 + stackIndex * 32}px`,
                            zIndex: 21 + stackIndex
                          }}
                        >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 text-sm">{request.item}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${request.status === "承認"
                    ? "bg-green-100 text-green-800"
                    : request.status === "否認"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                    }`}>
                    {request.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm mb-2">
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
                  <div className="bg-gray-50 rounded p-2">
                    <h4 className="font-medium text-gray-700 mb-1 text-sm">変更内容</h4>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <span>出勤:</span>
                        <div className="flex space-x-1">
                          <span className={request.originalData.clockIn !== request.updatedData.clockIn ? 'line-through text-red-500' : ''}>
                            {request.originalData.clockIn}
                          </span>
                          <span>→</span>
                          <span className={request.originalData.clockIn !== request.updatedData.clockIn ? 'text-green-600 font-bold' : ''}>
                            {request.updatedData.clockIn}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>退勤:</span>
                        <div className="flex space-x-1">
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
                {request.comment && (
                  <div className="mb-1">
                    <span className="text-gray-600 text-sm">コメント:</span>
                    <span className="text-sm ml-1">{request.comment}</span>
                  </div>
                )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white shadow p-8 text-center">
                <div className="text-gray-500 text-lg">データがありません</div>
              </div>
            )}
          </div>
      </div>
    </div>
  );
}

export default RequestList;