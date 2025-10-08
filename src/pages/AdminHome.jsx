import React, { useState, useEffect, useMemo } from "react";
import Button from "../components/Button.jsx";
import Modal from "../components/Modal.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import TabNavigation from "../components/TabNavigation.jsx";
import SearchFilterTable from "../components/SearchFilterTable.jsx";
import { collection, getDocs, doc, updateDoc, addDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { COLLECTIONS, generateDocId } from '../constants/firestore.js';

/**
 * 管理者用ホーム画面コンポーネント
 * 申請一覧を表示
 */
function AdminHome() {
  const [activeTab, setActiveTab] = useState("未対応");
  const [selectedItems, setSelectedItems] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // 検索キーワード
  const [dateSearchTerm, setDateSearchTerm] = useState(""); // 申請日検索
  const [applicantSearchTerm, setApplicantSearchTerm] = useState(""); // 申請者名検索
  const [filterItem, setFilterItem] = useState("all"); // 項目フィルター
  const [searchFilteredRequests, setSearchFilteredRequests] = useState([]); // 検索フィルター済みデータ
  const [showBulkConfirmModal, setShowBulkConfirmModal] = useState(false); // 一括承認確認モーダル
  const [showReopenModal, setShowReopenModal] = useState(false); // 未対応に戻す確認モーダル
  const [showApproveModal, setShowApproveModal] = useState(false); // 承認確認モーダル
  const [showRejectModal, setShowRejectModal] = useState(false); // 否認確認モーダル
  const [selectedReopenItem, setSelectedReopenItem] = useState(null); // 未対応に戻す対象
  const [selectedActionItem, setSelectedActionItem] = useState(null); // 承認/否認対象

  // タブ切り替え時に選択状態をクリア
  useEffect(() => {
    setSelectedItems([]);
  }, [activeTab]);

  // Firestoreからデータを取得
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, COLLECTIONS.CHANGE_REQUESTS));
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
            }
          ];

          // 初期データをFirestoreに追加
          for (const request of initialRequests) {
            await addDoc(collection(db, COLLECTIONS.CHANGE_REQUESTS), request);
          }

          // 追加したデータを再取得
          const newQuerySnapshot = await getDocs(collection(db, COLLECTIONS.CHANGE_REQUESTS));
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

  // タブに応じてデータをフィルタリング（メモ化して配列参照を安定化）
  // 管理者は最新100件まで表示
  const filteredRequests = useMemo(() => {
    const filtered = requests.filter(request => {
      if (activeTab === "未対応") {
        return request.status === "未対応";
      } else if (activeTab === "対応済み") {
        return request.status === "承認" || request.status === "否認";
      }
      return false;
    });
    
    // 最新100件のみ返す
    return filtered.slice(0, 100);
  }, [requests, activeTab]);

  // カラム定義
  const columns = [
    { key: "item", label: "申請項目", sortable: true },
    { key: "date", label: "申請日", sortable: true },
    { key: "applicant", label: "申請者名", sortable: true },
    { key: "targetDate", label: "対象日", sortable: true },
    { key: "originalData", label: "変更前", sortable: false },
    { key: "updatedData", label: "変更後", sortable: false },
    { key: "comment", label: "コメント", sortable: false },
    { key: "status", label: "ステータス", sortable: true },
    { key: "actions", label: "操作", sortable: false }
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
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <div className="flex items-center">
          <span>{request.item}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {request.date}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {request.applicant.replace('@', '＠')}
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
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
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
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {request.comment || "コメントなし"}
      </td>
      {/* ステータス（表示のみ） */}
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <span className={`px-2 py-1 text-xs rounded ${request.status === "承認"
          ? "bg-green-100 text-green-800"
          : request.status === "否認"
            ? "bg-yellow-100 text-yellow-800"
            : request.status === "未対応"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }`}>
          {request.status}
        </span>
      </td>
      {/* 操作（アクション） */}
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        {request.status === "未対応" ? (
          <div className="flex space-x-2">
            <Button
              variant="none"
              className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg min-h-[36px]"
              onClick={() => handleRejectClick(request)}
            >
              否認
            </Button>
            <Button
              variant="none"
              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg min-h-[36px]"
              onClick={() => handleApproveClick(request)}
            >
              承認
            </Button>
          </div>
        ) : (
          <Button
            variant="none"
            className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg min-h-[36px]"
            onClick={() => handleReopenClick(request)}
          >
            未対応に戻す
          </Button>
        )}
      </td>
    </>
  );

  const handleSelectAll = (checked) => {
    if (checked) {
      // 現在のタブの未対応申請のみを選択
      const currentTabRequests = searchFilteredRequests.filter(request => request.status === "未対応");
      setSelectedItems(currentTabRequests.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id, checked) => {
    if (checked) {
      // 未対応申請のみ選択可能
      const request = searchFilteredRequests.find(req => req.id === id);
      if (request && request.status === "未対応") {
        setSelectedItems([...selectedItems, id]);
      }
    } else {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    }
  };

  // 承認確認モーダルを表示
  const handleApproveClick = (request) => {
    setSelectedActionItem(request);
    setShowApproveModal(true);
  };

  // 否認確認モーダルを表示
  const handleRejectClick = (request) => {
    setSelectedActionItem(request);
    setShowRejectModal(true);
  };

  // ステータス更新処理
  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      // 申請データを取得
      const requestRef = doc(db, COLLECTIONS.CHANGE_REQUESTS, requestId);
      const requestSnap = await getDoc(requestRef);
      const requestData = requestSnap.data();

      // requestsコレクションを更新
      await updateDoc(requestRef, { status: newStatus });

      // 勤怠データも更新
      if (requestData.userId && requestData.attendanceDate) {
        const attendanceRef = doc(db, COLLECTIONS.TIME_RECORDS, generateDocId.timeRecord(requestData.userId, requestData.attendanceDate));

        if (newStatus === "承認") {
          // 承認された場合：申請された変更内容を適用
          await updateDoc(attendanceRef, {
            status: "承認済み",
            clockIn: requestData.updatedData?.clockIn || requestData.originalData?.clockIn,
            clockOut: requestData.updatedData?.clockOut || requestData.originalData?.clockOut,
            breakTime: requestData.updatedData?.breakTime || requestData.originalData?.breakTime
          });
        } else if (newStatus === "否認") {
          // 否認された場合：元のデータに戻す
          await updateDoc(attendanceRef, {
            status: "否認",
            clockIn: requestData.originalData?.clockIn,
            clockOut: requestData.originalData?.clockOut,
            breakTime: requestData.originalData?.breakTime
          });
        }
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

  // 一括承認確認モーダルを表示
  const handleBulkApproveClick = () => {
    if (selectedItems.length === 0) return;
    setShowBulkConfirmModal(true);
  };

  // 一括承認処理
  const handleBulkApprove = async () => {
    if (selectedItems.length === 0) return;

    try {
      // 選択された申請の詳細を取得
      const selectedRequests = filteredRequests.filter(request => selectedItems.includes(request.id));

      // Firestoreを一括更新
      const updatePromises = selectedItems.map(async (requestId) => {
        const requestRef = doc(db, COLLECTIONS.CHANGE_REQUESTS, requestId);
        await updateDoc(requestRef, { status: "承認" });
      });
      await Promise.all(updatePromises);

      // 勤怠データも一括更新
      const attendanceUpdatePromises = selectedRequests.map(async (request) => {
        if (request.userId && request.attendanceDate) {
          const attendanceRef = doc(db, COLLECTIONS.TIME_RECORDS, generateDocId.timeRecord(request.userId, request.attendanceDate));
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
      setShowBulkConfirmModal(false);
    } catch (error) {
      console.error("一括承認エラー:", error);
    }
  };

  // 未対応に戻す確認モーダルを表示
  const handleReopenClick = (request) => {
    setSelectedReopenItem(request);
    setShowReopenModal(true);
  };

  // 未対応に戻す処理
  const handleReopen = async () => {
    if (!selectedReopenItem) return;

    try {
      const requestRef = doc(db, COLLECTIONS.CHANGE_REQUESTS, selectedReopenItem.id);
      await updateDoc(requestRef, { status: "未対応" });

      // 勤怠データも未対応に戻す
      if (selectedReopenItem.userId && selectedReopenItem.attendanceDate) {
        const attendanceRef = doc(db, COLLECTIONS.TIME_RECORDS, generateDocId.timeRecord(selectedReopenItem.userId, selectedReopenItem.attendanceDate));
        await updateDoc(attendanceRef, { status: "申請中" });
      }

      // ローカル状態を更新
      setRequests(prevRequests =>
        prevRequests.map(request =>
          request.id === selectedReopenItem.id
            ? { ...request, status: "未対応" }
            : request
        )
      );
      setShowReopenModal(false);
      setSelectedReopenItem(null);
    } catch (error) {
      console.error("未対応に戻すエラー:", error);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen p-6 flex items-center justify-center">
        <div className="text-lg text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4 pb-24 md:p-6 md:pb-28 lg:pb-8">
      <div className="w-full h-full flex flex-col">
        <h1 className="hidden md:block text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4">申請一覧</h1>

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

      {/* デスクトップ用テーブル */}
      <div className={filteredRequests.length > 0 ? "flex-1" : ""}>
        <SearchFilterTable
            data={filteredRequests}
            columns={columns}
            dateSearchTerm={dateSearchTerm}
            onDateSearchChange={setDateSearchTerm}
            applicantSearchTerm={applicantSearchTerm}
            onApplicantSearchChange={setApplicantSearchTerm}
            filterValue={filterItem}
            onFilterChange={setFilterItem}
            filterOptions={filterOptions}
            filterLabel="申請項目"
            showCheckbox={activeTab === "未対応"}
            selectedItems={selectedItems}
            onSelectAll={handleSelectAll}
            onSelectItem={handleSelectItem}
            renderRow={renderRow}
            onFilteredDataChange={setSearchFilteredRequests}
            headerBgClass="bg-emerald-500"
            headerHoverBgClass="hover:bg-emerald-600"
            headerTextClass="text-white"
            sortIconActiveClass="text-white"
            sortIconInactiveClass="text-emerald-200"
            extraControls={
              activeTab === "未対応" && (
                <Button
                  variant="none"
                  className="px-6 py-2 bg-blue-600 hover:bg-purple-700 text-white rounded-lg"
                  onClick={handleBulkApproveClick}
                  disabled={selectedItems.length === 0}
                >
                  一括承認 ({selectedItems.length})
                </Button>
              )
            }
          />
      </div>

      {/* モバイル・タブレット用カード表示 */}
      <div className="lg:hidden space-y-2">
        {/* 全選択ボタン（モバイル） */}
        {activeTab === "未対応" && searchFilteredRequests.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                checked={selectedItems.length === searchFilteredRequests.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">
                全選択 ({selectedItems.length}/{searchFilteredRequests.length})
              </span>
            </div>
          </div>
        )}

        {searchFilteredRequests.map((request) => (
          <div key={request.id} className="bg-white rounded-lg shadow-sm p-2 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {activeTab === "未対応" && (
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(request.id)}
                    onChange={(e) => handleSelectItem(request.id, e.target.checked)}
                    className="rounded border-gray-300"
                  />
                )}
                <span className="font-medium text-gray-900">{request.item}</span>
              </div>
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
                <span className="ml-1 font-medium" >{request.date}</span>
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
                <div className="flex items-center space-x-4 text-xs">
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

            {/* アクションボタン */}
            {request.status === "未対応" && (
              <div className="flex space-x-2">
                <Button
                  variant="none"
                  className="flex-1 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg"
                  onClick={() => handleRejectClick(request)}
                >
                  否認
                </Button>
                <Button
                  variant="none"
                  className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg"
                  onClick={() => handleApproveClick(request)}
                >
                  承認
                </Button>
              </div>
            )}
            {(request.status === "承認" || request.status === "否認") && (
              <div className="flex justify-end">
                <Button
                  variant="none"
                  className="px-2 py-1 bg-red-500 hover:bg-gray-600 text-white text-xs rounded-lg"
                  onClick={() => handleReopenClick(request)}
                >
                  未対応に戻す
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 一括承認確認モーダル */}
      <ConfirmModal
        isOpen={showBulkConfirmModal}
        onClose={() => setShowBulkConfirmModal(false)}
        title="一括承認の確認"
        message={`選択された ${selectedItems.length}件 の申請を一括承認しますか？\nこの操作は取り消すことができません。`}
        confirmText="一括承認する"
        cancelText="キャンセル"
        onConfirm={handleBulkApprove}
        variant="info"
        icon="⚠️"
      />

      {/* 承認確認モーダル */}
      <ConfirmModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="承認の確認"
        message={`${selectedActionItem?.applicant} の申請を承認しますか？`}
        confirmText="承認する"
        cancelText="キャンセル"
        onConfirm={() => handleStatusUpdate(selectedActionItem?.id, "承認")}
        variant="success"
        icon="✅"
      />

      {/* 否認確認モーダル */}
      <ConfirmModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="否認の確認"
        message={`${selectedActionItem?.applicant} の申請を否認しますか？`}
        confirmText="否認する"
        cancelText="キャンセル"
        onConfirm={() => handleStatusUpdate(selectedActionItem?.id, "否認")}
        variant="warning"
        icon="⚠️"
      />

      {/* 未対応に戻す確認モーダル */}
      <ConfirmModal
        isOpen={showReopenModal}
        onClose={() => setShowReopenModal(false)}
        title="未対応に戻す確認"
        message={`${selectedReopenItem?.applicant} の申請を\n${selectedReopenItem?.status} から 未対応 に戻しますか？`}
        confirmText="未対応に戻す"
        cancelText="キャンセル"
        onConfirm={handleReopen}
        variant="danger"
        icon="⚠️"
      />

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
                  <div className="font-medium text-gray-600 mb-1">申請項目</div>
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
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              閉じる
            </button>
          </div>
        </div>
      </Modal>
      </div>
    </div>
  );
}

export default AdminHome; 