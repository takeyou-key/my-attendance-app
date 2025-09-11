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
  renderRow
}) => {
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");

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
    <div>
      {/* 検索・フィルター機能 */}
      {(onFilterChange || onDateSearchChange || onApplicantSearchChange) && (
        <div className="mb-4 flex flex-wrap gap-4 items-center">
          {/* 項目フィルター */}
          {onFilterChange && filterOptions.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">{filterLabel}:</label>
              <select
                value={filterValue}
                onChange={(e) => onFilterChange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-40"
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
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-40"
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
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-40"
              />
            </div>
          )}
        </div>
      )}

      {/* テーブル */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-auto" style={{ maxHeight: "calc(100vh - 300px)" }}>
          <table className="min-w-full whitespace-nowrap">
            <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm backdrop-blur-sm">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap ${column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                      }`}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center">
                      {column.label}
                      {column.sortable && sortField === column.key && (
                        <span className="ml-1 text-gray-400">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500">
                    データがありません
                  </td>
                </tr>
              ) : (
                sortedData.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-gray-50">
                    {renderRow(item, index)}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SearchFilterTable;
