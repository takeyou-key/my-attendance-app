import React from 'react';

/**
 * タブナビゲーションコンポーネント
 * アプリケーション全体で使用される統一されたタブナビゲーション
 * 
 * @param {Object} props - コンポーネントのプロパティ
 * @param {Array} props.tabs - タブの配列（{id: string, label: string}）
 * @param {string} props.activeTab - 現在アクティブなタブのID
 * @param {function} props.onTabChange - タブ変更時のコールバック関数
 * @param {string} props.className - 追加のCSSクラス
 * @param {string} props.variant - タブのスタイルバリエーション（"default", "underline"）（デフォルト: "default"）
 */
const TabNavigation = ({ 
  tabs, 
  activeTab, 
  onTabChange, 
  className = "",
  variant = "default"
}) => {
  const baseClasses = "flex border-b border-gray-300 mb-6";
  const combinedClasses = `${baseClasses} ${className}`.trim();

  const getTabClasses = (tabId) => {
    const isActive = tabId === activeTab;
    
    if (variant === "underline") {
      return `px-4 py-2 font-medium ${
        isActive 
          ? "text-blue-600 border-b-2 border-blue-600" 
          : "text-gray-500 hover:text-gray-700"
      }`;
    }
    
    // default variant
    return `px-6 py-3 font-medium rounded-t-lg ${
      isActive
        ? "bg-white text-gray-800 border-b-2 border-purple-500"
        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
    }`;
  };

  return (
    <div className={combinedClasses}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={getTabClasses(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation; 