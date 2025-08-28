import React from 'react';
import Button from './Button.jsx';

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
    pointerEvents: 'none',
    userSelect: 'text',
    WebkitUserSelect: 'text',
    MozUserSelect: 'text',
    msUserSelect: 'text'
  };

  // メールアドレスを表示用に変換（@を全角に）
  const formatEmail = (email) => {
    if (!email) return '';
    return `ID：${email.replace('@', '＠')}`;
  };

  return (
    <header className={combinedClasses} style={headerStyle}>
      {showNavigation ? (
        <div className="flex items-center justify-between w-full">
          <div className="text-white text-lg md:text-2xl font-bold">勤怠管理アプリ</div>
          <div className="flex flex-col items-end gap-1 md:gap-2">
            <div className="text-xs md:text-sm text-white">
              {userEmail === undefined ? (
                <span className="animate-pulse">...</span>
              ) : userEmail ? (
                <span style={emailStyle} data-email={userEmail}>
                  {formatEmail(userEmail)}
                </span>
              ) : null}
            </div>
            {onLogout && (
              <Button
                onClick={onLogout}
                variant="secondary"
                className="px-3 py-1 md:px-6 md:py-2 text-xs md:text-sm rounded-full"
                textColor={textColor}
              >
                {logoutLabel}
              </Button>
            )}
          </div>
          {children}
        </div>
      ) : (
        <div className="flex items-center justify-between w-full">
          <div className="text-white text-lg md:text-2xl font-bold">勤怠管理アプリ</div>
          <div className="ml-2 md:ml-4 text-xs md:text-sm text-white">
            {userEmail === undefined ? (
              <span className="animate-pulse">...</span>
            ) : userEmail ? (
              <span style={emailStyle} data-email={userEmail}>
                ( {formatEmail(userEmail)} )
              </span>
            ) : null}
          </div>
          {onLogout && (
            <Button
              onClick={onLogout}
              variant="secondary"
              className="px-3 py-1 md:px-6 md:py-2 text-xs md:text-sm rounded-full"
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