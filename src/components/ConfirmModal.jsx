import React from 'react';
import Modal from './Modal.jsx';
import Button from './Button.jsx';

/**
 * 汎用確認モーダルコンポーネント
 * 承認・否認・未対応に戻すなどの確認ダイアログで使用
 */
const ConfirmModal = ({
  isOpen,
  onClose,
  title,
  message,
  confirmText = "確認",
  cancelText = "キャンセル",
  onConfirm,
  onCancel,
  variant = "default", // success, warning, danger, info
  icon = "⚠️"
}) => {
  // バリアントに応じたスタイル設定
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return {
          iconColor: "text-green-500",
          confirmButtonClass: "bg-green-600 hover:bg-green-700 text-white",
          icon: "✅"
        };
      case "warning":
        return {
          iconColor: "text-yellow-500",
          confirmButtonClass: "bg-yellow-600 hover:bg-yellow-700 text-white",
          icon: "⚠️"
        };
      case "danger":
        return {
          iconColor: "text-red-500",
          confirmButtonClass: "bg-red-600 hover:bg-red-700 text-white",
          icon: "❌"
        };
      case "info":
        return {
          iconColor: "text-blue-500",
          confirmButtonClass: "bg-blue-600 hover:bg-blue-700 text-white",
          icon: "ℹ️"
        };
      default:
        return {
          iconColor: "text-gray-500",
          confirmButtonClass: "bg-gray-600 hover:bg-gray-700 text-white",
          icon: "⚠️"
        };
    }
  };

  const styles = getVariantStyles();

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    if (onClose) {
      onClose();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      showCloseButton={false}
      className="text-center"
    >
      <div className="text-center">
        <div className={`${styles.iconColor} text-3xl mb-4`}>
          {icon || styles.icon}
        </div>
        <h3 className="text-lg font-bold mb-4">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">
          {message}
        </p>
        <div className="flex justify-center gap-3">
          <Button
            onClick={handleCancel}
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            variant="none"
            className={`px-6 py-2 rounded-xl ${styles.confirmButtonClass}`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
