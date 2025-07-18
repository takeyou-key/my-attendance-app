import React from "react";

const PopoutMessage = ({ show, children }) => {
  if (!show) return null;
  return (
    <div className="absolute inset-0 flex items-center justify-center z-40">
      {/* 背景オーバーレイ */}
      <div className="absolute inset-0 bg-gray-500 opacity-70 z-0" />
      {/* メッセージ本体 */}
      <div className="relative bg-white rounded-2xl shadow-xl px-12 py-10 text-center text-xl font-normal z-10">
        {children}
      </div>
    </div>
  );
};

export default PopoutMessage; 