import React from 'react';

/**
 * モーダルコンポーネント
 * アプリケーション全体で使用される統一されたモーダル表示
 * 
 * @param {Object} props - コンポーネントのプロパティ
 * @param {boolean} props.isOpen - モーダルの表示状態
 * @param {function} props.onClose - モーダルを閉じる関数
 * @param {React.ReactNode} props.children - モーダル内のコンテンツ
 * @param {string} props.size - モーダルのサイズ（"sm", "md", "lg", "xl"）（デフォルト: "md"）
 * @param {string} props.className - 追加のCSSクラス
 * @param {boolean} props.showCloseButton - 閉じるボタンを表示するかどうか（デフォルト: true）
 * @param {string} props.closeButtonText - 閉じるボタンのテキスト（デフォルト: "✕"）
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  size = "md",
  className = "",
  showCloseButton = true,
  closeButtonText = "✕"
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md", 
    lg: "max-w-lg",
    xl: "max-w-2xl"
  };

  const modalSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg shadow-xl ${modalSize} w-full mx-4 relative ${className}`}>
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
            aria-label="閉じる"
          >
            {closeButtonText}
          </button>
        )}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal; 