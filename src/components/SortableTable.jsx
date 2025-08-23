import React, { useState, useMemo } from 'react';
import Button from './Button.jsx';

/**
 * ソート・検索機能付きテーブルコンポーネント
 * 
 * @param {Object} props - コンポーネントのプロパティ
 * @param {Array} props.data - テーブルに表示するデータ配列
 * @param {Array} props.columns - カラム定義配列
 * @param {string} props.searchTerm - 検索キーワード
 * @param {Function} props.onSearchChange - 検索キーワード変更時のコールバック
 * @param {string} props.filterValue - フィルター値
 * @param {Function} props.onFilterChange - フィルター値変更時のコールバック
 * @param {Array} props.filterOptions - フィルターオプション配列
 * @param {string} props.filterLabel - フィルターラベル
 * @param {string} props.searchPlaceholder - 検索プレースホルダー
 * @param {boolean} props.showCheckbox - チェックボックス表示フラグ
 * @param {Array} props.selectedItems - 選択されたアイテム配列
 * @param {Function} props.onSelectAll - 全選択時のコールバック
 * @param {Function} props.onSelectItem - 個別選択時のコールバック
 * @param {Function} props.renderRow - 行レンダリング関数
 * @param {React.ReactNode} props.extraControls - 追加のコントロール要素
 */
const SortableTable = ({
  data,
  columns,
  searchTerm = "",
  onSearchChange,
  filterValue = "all",
  onFilterChange,
  filterOptions = [],
  filterLabel = "項目",
  searchPlaceholder = "検索...",
  showCheckbox = false,
  selectedItems = [],
  onSelectAll,
  onSelectItem,
  renderRow,
  extraControls
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
      
      // 検索キーワード
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          item.applicant?.toLowerCase().includes(searchLower) ||
          item.item?.toLowerCase().includes(searchLower) ||
          item.targetDate?.toLowerCase().includes(searchLower) ||
          item.date?.toLowerCase().includes(searchLower) ||
          item.comment?.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });
  }, [data, filterValue, searchTerm]);

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
      {(onSearchChange || onFilterChange) && (
        <div className="mb-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center">
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
            
            {/* 検索ボックス */}
            {onSearchChange && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">検索:</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-64"
                />
              </div>
            )}
          </div>
          
          {/* 追加コントロール */}
          {extraControls}
        </div>
      )}

      {/* テーブル */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-auto" style={{ maxHeight: "calc(100vh - 300px)" }}>
          <table className="min-w-full whitespace-nowrap">
            <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm backdrop-blur-sm">
              <tr>
                {showCheckbox && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === sortedData.length && sortedData.length > 0}
                      onChange={(e) => onSelectAll?.(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap ${
                      column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
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
                  <td colSpan={columns.length + (showCheckbox ? 1 : 0)} className="px-6 py-4 text-center text-gray-500">
                    データがありません
                  </td>
                </tr>
              ) : (
                sortedData.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-gray-50">
                    {showCheckbox && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={(e) => onSelectItem?.(item.id, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    )}
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

export default SortableTable;
