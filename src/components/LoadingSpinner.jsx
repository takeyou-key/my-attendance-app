import React from 'react';
import { ClipLoader, BeatLoader, PulseLoader, RingLoader } from 'react-spinners';

/**
 * ローディングスピナーコンポーネント
 * react-spinnersを使用した美しいローディングアニメーション
 * 
 * @param {Object} props - コンポーネントのプロパティ
 * @param {string} props.message - ローディングメッセージ（デフォルト: "読み込み中..."）
 * @param {string} props.size - スピナーのサイズ（"sm", "md", "lg"）（デフォルト: "md"）
 * @param {string} props.className - 追加のCSSクラス
 * @param {boolean} props.fullScreen - フルスクリーン表示するかどうか（デフォルト: false）
 * @param {string} props.type - スピナーの種類（"clip", "beat", "pulse", "ring"）（デフォルト: "clip"）
 */
const LoadingSpinner = ({ 
  message = "読み込み中...", 
  size = "md", 
  className = "",
  fullScreen = false,
  type = "clip"
}) => {
  const sizeClasses = {
    sm: 30,
    md: 50, 
    lg: 70
  };

  const spinnerSize = sizeClasses[size] || sizeClasses.md;

  // スピナーの種類に応じてコンポーネントを選択
  const getSpinner = () => {
    const commonProps = {
      color: "#3b82f6",
      size: spinnerSize,
      loading: true
    };

    switch (type) {
      case "beat":
        return <BeatLoader {...commonProps} />;
      case "pulse":
        return <PulseLoader {...commonProps} />;
      case "ring":
        return <RingLoader {...commonProps} />;
      default:
        return <ClipLoader {...commonProps} />;
    }
  };

  const spinnerContent = (
    <div className={`text-center ${className}`}>
      <div className="flex justify-center mb-4">
        {getSpinner()}
      </div>
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white bg-opacity-80">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

export default LoadingSpinner; 