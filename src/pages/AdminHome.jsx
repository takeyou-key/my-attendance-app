import React from "react";
import Button from "../components/Button";
import Modal from "../components/Modal";
import TabNavigation from "../components/TabNavigation";
import { collection, getDocs, doc, updateDoc, addDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * 管理者用ホーム画面コンポーネント
 * 申請一覧を表示
 */
function AdminHome() {
  const [activeTab, setActiveTab] = React.useState("未対応");
  const [selectedItems, setSelectedItems] = React.useState([]);
  const [requests, setRequests] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedRequest, setSelectedRequest] = React.useState(null);
  const [showDetailModal, setShowDetailModal] = React.useState(false);

  // Firestoreからデータを取得
  React.useEffect(() => {
    const fetchRequests = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "requests"));
        const requestsData = [];
        querySnapshot.forEach((doc) => {
          requestsData.push({ id: doc.id, ...doc.data() });
        });
        
        // データが空の場合は初期データを追加
        if (requestsData.length === 0) {
          const initialRequests = [
            {
              item: "有給休暇申請",
              date: "7月31日",
              applicant: "佐藤さとる",
              targetDate: "7月25日",
              details: "家族旅行のため有給休暇を申請いたします",
              status: "未対応"
            },
            {
              item: "残業申請",
              date: "7月31日",
              applicant: "田中花子",
              targetDate: "7月26日",
              details: "プロジェクト締切のため残業申請いたします",
              status: "未対応"
            },
            {
              item: "遅刻申請",
              date: "7月31日",
              applicant: "山田太郎",
              targetDate: "7月27日",
              details: "電車遅延のため遅刻申請いたします",
              status: "未対応"
            },
            {
              item: "有給休暇申請",
              date: "7月30日",
              applicant: "鈴木一郎",
              targetDate: "7月20日",
              details: "体調不良のため有給休暇を申請いたします",
              status: "承認"
            },
            {
              item: "残業申請",
              date: "7月29日",
              applicant: "高橋美咲",
              targetDate: "7月22日",
              details: "納期のため残業申請いたします",
              status: "否認"
            }
          ];
          
          // 初期データをFirestoreに追加
          for (const request of initialRequests) {
            await addDoc(collection(db, "requests"), request);
          }
          
          // 追加したデータを再取得
          const newQuerySnapshot = await getDocs(collection(db, "requests"));
          const newRequestsData = [];
          newQuerySnapshot.forEach((doc) => {
            newRequestsData.push({ id: doc.id, ...doc.data() });
          });
          setRequests(newRequestsData);
        } else {
          setRequests(requestsData);
        }
        setLoading(false);
      } catch (error) {
        console.error("申請データ取得エラー:", error);
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // タブに応じてデータをフィルタリング
  const filteredRequests = requests.filter(request => {
    if (activeTab === "未対応") {
      return request.status === "未対応";
    } else if (activeTab === "対応済み") {
      return request.status === "承認" || request.status === "否認";
    }
    return false;
  });

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(filteredRequests.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id, checked) => {
    if (checked) {
      setSelectedItems([...selectedItems, id]);
    } else {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    }
  };

  // ステータス更新処理
  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      // 申請データを取得
      const requestRef = doc(db, "requests", requestId);
      const requestSnap = await getDoc(requestRef);
      const requestData = requestSnap.data();
      
      // requestsコレクションを更新
      await updateDoc(requestRef, { status: newStatus });
      
      // 勤怠データも更新（申請が承認された場合）
      if (requestData.userId && requestData.attendanceDate) {
        const attendanceRef = doc(db, "attendances", `${requestData.userId}_${requestData.attendanceDate}`);
        await updateDoc(attendanceRef, { 
          status: newStatus === "承認" ? "承認済み" : "否認"
        });
      }
      
      // ローカル状態を更新
      setRequests(prevRequests => 
        prevRequests.map(request => 
          request.id === requestId 
            ? { ...request, status: newStatus }
            : request
        )
      );
      // 選択状態をクリア
      setSelectedItems(selectedItems.filter(id => id !== requestId));
    } catch (error) {
      console.error("ステータス更新エラー:", error);
    }
  };

  // 一括承認処理
  const handleBulkApprove = async () => {
    if (selectedItems.length === 0) return;
    
    try {
      // 選択された申請の詳細を取得
      const selectedRequests = requests.filter(request => selectedItems.includes(request.id));
      
      // Firestoreを一括更新
      const updatePromises = selectedItems.map(async (requestId) => {
        const requestRef = doc(db, "requests", requestId);
        await updateDoc(requestRef, { status: "承認" });
      });
      await Promise.all(updatePromises);
      
      // 勤怠データも一括更新
      const attendanceUpdatePromises = selectedRequests.map(async (request) => {
        if (request.userId && request.attendanceDate) {
          const attendanceRef = doc(db, "attendances", `${request.userId}_${request.attendanceDate}`);
          await updateDoc(attendanceRef, { status: "承認済み" });
        }
      });
      await Promise.all(attendanceUpdatePromises);
      
      // ローカル状態を更新
      setRequests(prevRequests => 
        prevRequests.map(request => 
          selectedItems.includes(request.id) && request.status === "未対応"
            ? { ...request, status: "承認" }
            : request
        )
      );
      setSelectedItems([]);
    } catch (error) {
      console.error("一括承認エラー:", error);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full p-6 flex items-center justify-center">
        <div className="text-lg text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">申請一覧</h1>
        
        {/* タブ */}
        <TabNavigation
          tabs={[
            { id: "未対応", label: "未対応" },
            { id: "対応済み", label: "対応済み" }
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          variant="underline"
        />
      </div>

      {/* 一括承認ボタン */}
      {activeTab === "未対応" && (
        <div className="flex justify-end mb-4">
          <Button
            variant="none"
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
            onClick={handleBulkApprove}
            disabled={selectedItems.length === 0}
          >
            一括承認 ({selectedItems.length})
          </Button>
        </div>
      )}

      {/* テーブル */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-auto" style={{ maxHeight: "calc(100vh - 300px)" }}>
          <table className="min-w-full whitespace-nowrap">
          <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm backdrop-blur-sm">
            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === filteredRequests.length && filteredRequests.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  申請項目
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  申請日
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  申請者名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  対象日
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  変更前
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  変更後
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  コメント
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  ステータス
                </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRequests.map((request) => (
              <tr key={request.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(request.id)}
                    onChange={(e) => handleSelectItem(request.id, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    <span>{request.item}</span>
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowDetailModal(true);
                      }}
                      className="ml-2 text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      詳細
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {request.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {request.applicant}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {request.targetDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {request.originalData ? (
                    <div className="text-xs">
                      <div className="mb-1">
                        <span className="font-medium text-gray-600">出勤:</span> 
                        <span className={`ml-1 ${request.originalData.clockIn !== request.updatedData?.clockIn ? 'line-through text-red-500' : ''}`}>
                          {request.originalData.clockIn}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">退勤:</span> 
                        <span className={`ml-1 ${request.originalData.clockOut !== request.updatedData?.clockOut ? 'line-through text-red-500' : ''}`}>
                          {request.originalData.clockOut}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400">--</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {request.updatedData ? (
                    <div className="text-xs">
                      <div className="mb-1">
                        <span className="font-medium text-green-600">出勤:</span> 
                        <span className={`ml-1 ${request.originalData?.clockIn !== request.updatedData.clockIn ? 'text-green-600 font-bold' : ''}`}>
                          {request.updatedData.clockIn}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-green-600">退勤:</span> 
                        <span className={`ml-1 ${request.originalData?.clockOut !== request.updatedData.clockOut ? 'text-green-600 font-bold' : ''}`}>
                          {request.updatedData.clockOut}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400">--</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {request.comment ? (
                    <div className="max-w-xs">
                      <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded border">
                        {request.comment}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400">--</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {request.status === "未対応" ? (
                    <div className="flex space-x-2">
                      <Button
                        variant="none"
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                        onClick={() => handleStatusUpdate(request.id, "否認")}
                      >
                        否認
                      </Button>
                      <Button
                        variant="none"
                        className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs rounded"
                        onClick={() => handleStatusUpdate(request.id, "承認")}
                      >
                        承認
                      </Button>
                    </div>
                  ) : (
                    <span className={`px-2 py-1 text-xs rounded ${
                      request.status === "承認" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {request.status}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* 詳細モーダル */}
      <Modal
        isOpen={showDetailModal && selectedRequest}
        onClose={() => setShowDetailModal(false)}
        size="xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">申請者</h4>
              <p className="text-sm text-gray-600">{selectedRequest?.applicant}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">対象日</h4>
              <p className="text-sm text-gray-600">{selectedRequest?.targetDate}</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">変更内容</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-medium text-gray-600 mb-1">項目</div>
                  <div className="font-medium text-gray-600">出勤時刻</div>
                  <div className="font-medium text-gray-600">退勤時刻</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-red-600 mb-1">変更前</div>
                  <div className={`${selectedRequest?.originalData?.clockIn !== selectedRequest?.updatedData?.clockIn ? 'line-through text-red-500' : ''}`}>
                    {selectedRequest?.originalData?.clockIn || '--:--'}
                  </div>
                  <div className={`${selectedRequest?.originalData?.clockOut !== selectedRequest?.updatedData?.clockOut ? 'line-through text-red-500' : ''}`}>
                    {selectedRequest?.originalData?.clockOut || '--:--'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-green-600 mb-1">変更後</div>
                  <div className={`${selectedRequest?.originalData?.clockIn !== selectedRequest?.updatedData?.clockIn ? 'text-green-600 font-bold' : ''}`}>
                    {selectedRequest?.updatedData?.clockIn || '--:--'}
                  </div>
                  <div className={`${selectedRequest?.originalData?.clockOut !== selectedRequest?.updatedData?.clockOut ? 'text-green-600 font-bold' : ''}`}>
                    {selectedRequest?.updatedData?.clockOut || '--:--'}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 申請コメント */}
          {selectedRequest?.comment && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">申請コメント</h4>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-gray-700">{selectedRequest.comment}</p>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setShowDetailModal(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              閉じる
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default AdminHome; 