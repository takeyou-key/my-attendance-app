import React, { useState } from 'react';
import Button from './Button.jsx';
import { FaCalendarAlt } from 'react-icons/fa';

const Header = ({
  showNavigation = false,
  onLogout,
  className = "",
  children,
  userEmail,
  logoutLabel = "ログアウト",
  onMenuToggle,
  isMenuOpen,
  bgColor,
  textColor
}) => {
  const [showEmailTooltip, setShowEmailTooltip] = useState(false);
  const baseClasses = "w-full h-[78px] md:h-[116px] flex items-center px-4 md:px-8";
  const navigationClasses = showNavigation ? "" : "";
  const combinedClasses = `${baseClasses} ${navigationClasses} ${className}`.trim();

  const headerStyle = {};
  if (bgColor) {
    headerStyle.backgroundColor = bgColor;
    headerStyle.opacity = 0.6;
  } else {
    headerStyle.backgroundColor = '#4f46e5';
  }
  if (textColor) {
    headerStyle.color = textColor;
  }

  // メールアドレス表示用のスタイル
  const emailStyle = {
    cursor: 'pointer',
    position: 'relative',
    userSelect: 'text',
    WebkitUserSelect: 'text',
    MozUserSelect: 'text',
    msUserSelect: 'text'
  };

  // メールアドレスクリック時の処理
  const handleEmailClick = () => {
    setShowEmailTooltip(!showEmailTooltip);
  };

  // メールアドレスを表示用に変換（@以降を省略）
  const formatEmail = (email) => {
    if (!email) return '';
    const atIndex = email.indexOf('@');
    if (atIndex === -1) return `ID：${email}`;
    const localPart = email.substring(0, atIndex);
    return `ID：${localPart}...`;
  };

  // 表示するメールアドレスを決定
  const getDisplayEmail = (email) => {
    if (!email) return '';
    return showEmailTooltip ? `ID：${email}` : formatEmail(email);
  };

  return (
    <header className={combinedClasses} style={headerStyle}>
      {showNavigation ? (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="w-6 h-6 md:w-8 md:h-8 text-white" />
            <span className="text-white text-lg md:text-2xl font-bold">勤怠管理アプリ</span>
          </div>
          <div className="flex flex-col items-end gap-1 md:gap-2">
            <div className="text-xs md:text-sm text-white">
              {userEmail === undefined ? (
                <span className="animate-pulse">...</span>
              ) : userEmail ? (
                <span 
                  style={emailStyle} 
                  data-email={userEmail}
                  onClick={handleEmailClick}
                >
                  {getDisplayEmail(userEmail)}
                </span>
              ) : null}
            </div>
            {onLogout && (
              <Button
                onClick={onLogout}
                variant="secondary"
                className="px-4 py-1.5 md:px-6 md:py-2 text-xs md:text-sm rounded-lg"
                textColor={textColor}
              >
                {logoutLabel}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="w-6 h-6 md:w-8 md:h-8 text-white" />
            <span className="text-white text-lg md:text-2xl font-bold">勤怠管理アプリ</span>
          </div>
          <div className="ml-2 md:ml-4 text-xs md:text-sm text-white">
            {userEmail === undefined ? (
              <span className="animate-pulse">...</span>
            ) : userEmail ? (
              <span 
                style={emailStyle} 
                data-email={userEmail}
                onClick={handleEmailClick}
              >
                ( {getDisplayEmail(userEmail)} )
              </span>
            ) : null}
          </div>
          {onLogout && (
            <Button
              onClick={onLogout}
              variant="secondary"
              className="px-3 py-1 md:px-6 md:py-2 text-xs md:text-sm rounded-lg"
              textColor={textColor}
            >
              {logoutLabel}
            </Button>
          )}
        </div>
      )}
    </header>
  );
};

export default Header; 