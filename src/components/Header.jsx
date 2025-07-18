import React from 'react';
import Button from './Button';

const Header = ({ 
  showNavigation = false,
  onLogout,
  onHome,
  className = "",
  children,
  userEmail
}) => {
  const baseClasses = "w-full py-6 bg-indigo-600";
  const navigationClasses = showNavigation ? "px-8 flex items-center justify-between" : "mb-8";
  const combinedClasses = `${baseClasses} ${navigationClasses} ${className}`.trim();

  return (
    <header className={combinedClasses}>
      <div className="flex items-center justify-between w-full">
        <div className="text-white text-2xl font-bold">勤怠管理アプリ</div>
        <div className="ml-4 text-sm text-white">
          {userEmail === undefined ? (
            <span className="animate-pulse">...</span>
          ) : userEmail ? (
            `( ${userEmail} )`
          ) : null}
        </div>
        {showNavigation && (
          <div className="flex items-center gap-4">
            {onHome && (
              <Button
                onClick={onHome}
                variant="text"
                className="text-white px-4 py-2"
              >
                ホーム
              </Button>
            )}
            {onLogout && (
              <Button
                onClick={onLogout}
                variant="secondary"
                className="px-6 py-2 rounded-full"
              >
                ログアウト
              </Button>
            )}
            {children}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 