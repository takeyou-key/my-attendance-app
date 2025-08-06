import React, { useState, useEffect } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import TabNavigation from "../components/TabNavigation";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";

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
                    collection(db, "requests"),
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

    if (loading || !isAuthChecked) {
        return <LoadingSpinner fullScreen={true} />;
    }

  return (
    <div className="bg-gray-100">
      {/* メインコンテンツ */}
      <main className="p-6">
                <div className="max-w-6xl mx-auto">
                    {/* タイトル */}
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">申請一覧</h1>

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

                    {/* テーブル */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                            申請項目
                                        </th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                            申請日
                                        </th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                            対象日
                                        </th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                            修正対象
                                        </th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                            修正前
                                        </th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                            修正後
                                        </th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                            コメント
                                        </th>
                                        {activeTab === "completed" && (
                                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                ステータス
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredRequests.length === 0 ? (
                                        <tr>
                                            <td colSpan={activeTab === "completed" ? 8 : 7} className="px-6 py-4 text-center text-gray-500">
                                                データがありません
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRequests.map((request) => (
                                            <tr key={request.id} className="hover:bg-gray-50">
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
                                                    出勤・退勤時刻
                                                </td>
                                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {request.originalData ? (
                                                        <div className="text-xs">
                                                            <div>出勤: {request.originalData.clockIn}</div>
                                                            <div>退勤: {request.originalData.clockOut}</div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">--</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {request.updatedData ? (
                                                        <div className="text-xs">
                                                            <div>出勤: {request.updatedData.clockIn}</div>
                                                            <div>退勤: {request.updatedData.clockOut}</div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">--</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {request.comment || "コメントなし"}
                                                </td>
                                                {activeTab === "completed" && (
                                                    <td className="px-6 py-3 whitespace-nowrap text-sm">
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${request.status === "承認"
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-red-100 text-red-800"
                                                            }`}>
                                                            {request.status}
                                                        </span>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
              </div>
            </div>
        </div>
      </main>
    </div>
  );
}

export default RequestList;