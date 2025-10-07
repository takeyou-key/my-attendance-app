import React, { useState, useMemo } from 'react';

/**
 * 検索・フィルター機能付きテーブルコンポーネント
 * 
 * @param {Object} props - コンポーネントのプロパティ
 * @param {Array} props.data - テーブルに表示するデータ配列
 * @param {Array} props.columns - カラム定義配列
 * @param {string} props.dateSearchTerm - 申請日検索キーワード
 * @param {Function} props.onDateSearchChange - 申請日検索キーワード変更時のコールバック
 * @param {string} props.applicantSearchTerm - 申請者名検索キーワード
 * @param {Function} props.onApplicantSearchChange - 申請者名検索キーワード変更時のコールバック
 * @param {string} props.targetDateSearchTerm - 対象日検索キーワード
 * @param {Function} props.onTargetDateSearchChange - 対象日検索キーワード変更時のコールバック
 * @param {string} props.filterValue - フィルター値
 * @param {Function} props.onFilterChange - フィルター値変更時のコールバック
 * @param {Array} props.filterOptions - フィルターオプション配列
 * @param {string} props.filterLabel - フィルターラベル
 * @param {Function} props.renderRow - 行レンダリング関数
 */
const SearchFilterTable = ({
  data,
  columns,
  dateSearchTerm = "",
  onDateSearchChange,
  applicantSearchTerm = "",
  onApplicantSearchChange,
  targetDateSearchTerm = "",
  onTargetDateSearchChange,
  filterValue = "all",
  onFilterChange,
  filterOptions = [],
  filterLabel = "項目",
  renderRow,
  onFilteredDataChange,
  extraControls,
  showCheckbox = false,
  selectedItems = [],
  onSelectAll,
  onSelectItem,
  // ヘッダーカラーをカスタマイズ（Tailwindクラス文字列）
  headerBgClass = "bg-emerald-500",
  headerHoverBgClass = "hover:bg-emerald-600",
  headerTextClass = "text-white",
  // 初期ソート設定
  initialSortField = "date",
  initialSortDirection = "desc",
  // ソートアイコンの色（見やすさ調整用）
  sortIconActiveClass = "text-gray-200",
  sortIconInactiveClass = "text-gray-300"
}) => {
  const [sortField, setSortField] = useState(initialSortField);
  const [sortDirection, setSortDirection] = useState(initialSortDirection);

  // 検索・フィルター機能
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // フィルター
      if (filterValue !== "all" && item.item !== filterValue) {
        return false;
      }

      // 申請日フィルター
      if (dateSearchTerm) {
        const searchDate = dateSearchTerm.replace(/-/g, '/');
        if (!item.date?.includes(searchDate)) {
          return false;
        }
      }

      // 申請者名フィルター
      if (applicantSearchTerm) {
        if (!item.applicant?.toLowerCase().includes(applicantSearchTerm.toLowerCase())) {
          return false;
        }
      }

      // 対象日フィルター
      if (targetDateSearchTerm) {
        const searchDate = targetDateSearchTerm.replace(/-/g, '/');
        if (!item.targetDate?.includes(searchDate)) {
          return false;
        }
      }

      return true;
    });
  }, [data, filterValue, dateSearchTerm, applicantSearchTerm, targetDateSearchTerm]);

  // ソート機能
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case "date":
          aValue = a.date || "";
          bValue = b.date || "";
          break;
        case "applicant":
          aValue = a.applicant || "";
          bValue = b.applicant || "";
          break;
        case "targetDate":
          aValue = a.targetDate || "";
          bValue = b.targetDate || "";
          break;
        case "item":
          aValue = a.item || "";
          bValue = b.item || "";
          break;
        case "status":
          aValue = a.status || "";
          bValue = b.status || "";
          break;
        default:
          aValue = a.date || "";
          bValue = b.date || "";
      }

      // 文字列比較
      if (typeof aValue === "string" && typeof bValue === "string") {
        const comparison = aValue.localeCompare(bValue, "ja");
        return sortDirection === "asc" ? comparison : -comparison;
      }

      // 数値比較（日付の場合）
      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sortField, sortDirection]);

  // フィルター済みデータを親コンポーネントに通知（内容が変わった時のみ）
  React.useEffect(() => {
    if (!onFilteredDataChange) return;
    // 直近に通知した内容を保持して、浅い比較で差分がある時だけ通知
    // 注意: 依存に入れると毎回変わるのでrefで保持
    if (!SearchFilterTable.__lastNotified) {
      SearchFilterTable.__lastNotified = new WeakMap();
    }
    const key = onFilteredDataChange;
    const prev = SearchFilterTable.__lastNotified.get(key);
    const sameLength = prev && prev.length === sortedData.length;
    const isShallowEqual = sameLength && prev.every((p, i) => p === sortedData[i]);
    if (!isShallowEqual) {
      onFilteredDataChange(sortedData);
      SearchFilterTable.__lastNotified.set(key, sortedData);
    }
  }, [sortedData, onFilteredDataChange]);

  // ソート処理
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 検索・フィルター機能 */}
      {(onFilterChange || onDateSearchChange || onApplicantSearchChange) && (
        <div className="mb-4 flex flex-wrap gap-2 lg:gap-4 items-center flex-shrink-0">
          {/* 項目フィルター */}
          {onFilterChange && filterOptions.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">{filterLabel}:</label>
              <select
                value={filterValue}
                onChange={(e) => onFilterChange(e.target.value)}
                className="border border-gray-300 rounded-md px-2 lg:px-3 py-1 lg:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-24 lg:w-auto"
              >
                <option value="all">すべて</option>
                {filterOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 申請日検索ボックス */}
          {onDateSearchChange && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">申請日:</label>
              <input
                type="date"
                value={dateSearchTerm}
                onChange={(e) => onDateSearchChange(e.target.value)}
                placeholder="申請日を入力"
                className="border border-gray-300 rounded-md px-2 lg:px-3 py-1 lg:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-28 lg:w-40"
              />
            </div>
          )}

          {/* 申請者名検索ボックス */}
          {onApplicantSearchChange && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">申請者名:</label>
              <input
                type="text"
                value={applicantSearchTerm}
                onChange={(e) => onApplicantSearchChange(e.target.value)}
                placeholder="申請者名を入力"
                className="border border-gray-300 rounded-md px-2 lg:px-3 py-1 lg:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-28 lg:w-40"
              />
            </div>
          )}

          {/* 対象日検索ボックス */}
          {onTargetDateSearchChange && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">対象日:</label>
              <input
                type="date"
                value={targetDateSearchTerm}
                onChange={(e) => onTargetDateSearchChange(e.target.value)}
                placeholder="対象日を入力"
                className="border border-gray-300 rounded-md px-2 lg:px-3 py-1 lg:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-28 lg:w-40"
              />
            </div>
          )}

          {/* 追加コントロール */}
          {extraControls && (
            <div className="ml-auto">
              {extraControls}
            </div>
          )}
        </div>
      )}

      {/* テーブル */}
      {sortedData.length > 0 ? (
        <div className="hidden lg:block bg-white shadow overflow-hidden">
          <div 
            className="overflow-auto bg-white" 
            style={{ maxHeight: "calc(100vh - 350px)" }}
          >
            <table className="min-w-full whitespace-nowrap">
              <thead className={`${headerBgClass} sticky top-0 z-10 shadow-sm backdrop-blur-sm`}>
                <tr>
                  {showCheckbox && (
                    <th className={`px-6 py-3 text-left text-xs font-medium ${headerTextClass} uppercase tracking-wider whitespace-nowrap ${headerBgClass}`}>
                      <input
                        type="checkbox"
                        checked={selectedItems.length === sortedData.length && sortedData.length > 0}
                        onChange={(e) => onSelectAll && onSelectAll(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                    </th>
                  )}
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={`px-6 py-3 text-left text-xs font-medium ${headerTextClass} uppercase tracking-wider whitespace-nowrap ${headerBgClass} ${column.sortable ? `cursor-pointer ${headerHoverBgClass}` : ''
                        }`}
                      onClick={() => column.sortable && handleSort(column.key)}
                    >
                      <div className="flex items-center">
                        {column.label}
                        {column.sortable && (
                          <span className={`ml-1 ${sortIconActiveClass}`}>
                            {sortField === column.key ? (
                              sortDirection === "asc" ? "↑" : "↓"
                            ) : (
                              <span className={sortIconInactiveClass}>↕</span>
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedData.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-gray-50">
                    {showCheckbox && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={(e) => onSelectItem && onSelectItem(item.id, e.target.checked)}
                          className="rounded border-gray-300"
                        />
                      </td>
                    )}
                    {renderRow(item, index)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow p-8 text-center flex-1">
          <div className="text-gray-500 text-lg">データがありません</div>
        </div>
      )}
    </div>
  );
};

export default SearchFilterTable;