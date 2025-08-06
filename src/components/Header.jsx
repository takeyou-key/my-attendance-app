import React from 'react';
import Button from './Button';

const Header = ({ 
  showNavigation = false,
  onLogout,
  className = "",
  children,
  userEmail,
  logoutLabel = "ログアウト"
}) => {
  const baseClasses = "w-full py-6 bg-indigo-600";
  const navigationClasses = showNavigation ? "px-8" : "mb-8";
  const combinedClasses = `${baseClasses} ${navigationClasses} ${className}`.trim();

  return (
    <header className={combinedClasses}>
      {showNavigation ? (
        <div className="flex items-center justify-between w-full">
          <div className="text-white text-2xl font-bold">勤怠管理アプリ</div>
          <div className="flex flex-col items-center gap-2">
            <div className="text-sm text-white">
              {userEmail === undefined ? (
                <span className="animate-pulse">...</span>
              ) : userEmail ? (
                `${userEmail}`
              ) : null}
            </div>
            {onLogout && (
              <Button
                onClick={onLogout}
                variant="secondary"
                className="px-6 py-2 rounded-full"
              >
                {logoutLabel}
              </Button>
            )}
          </div>
          {children}
        </div>
      ) : (
        <div className="flex items-center justify-between w-full">
          <div className="text-white text-2xl font-bold">勤怠管理アプリ</div>
          <div className="ml-4 text-sm text-white">
            {userEmail === undefined ? (
              <span className="animate-pulse">...</span>
            ) : userEmail ? (
              `( ${userEmail} )`
            ) : null}
          </div>
          {onLogout && (
            <Button
              onClick={onLogout}
              variant="secondary"
              className="px-6 py-2 rounded-full"
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