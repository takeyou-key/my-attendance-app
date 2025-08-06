import React from 'react';

/**
 * ローディングスピナーコンポーネント
 * アプリケーション全体で使用される統一されたローディング表示
 * 
 * @param {Object} props - コンポーネントのプロパティ
 * @param {string} props.message - ローディングメッセージ（デフォルト: "読み込み中..."）
 * @param {string} props.size - スピナーのサイズ（"sm", "md", "lg"）（デフォルト: "md"）
 * @param {string} props.className - 追加のCSSクラス
 * @param {boolean} props.fullScreen - フルスクリーン表示するかどうか（デフォルト: false）
 */
const LoadingSpinner = ({ 
  message = "読み込み中...", 
  size = "md", 
  className = "",
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12", 
    lg: "h-16 w-16"
  };

  const spinnerSize = sizeClasses[size] || sizeClasses.md;

  const spinnerContent = (
    <div className={`text-center ${className}`}>
      <div className={`animate-spin rounded-full ${spinnerSize} border-b-2 border-indigo-600 mx-auto`}></div>
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

export default LoadingSpinner; 