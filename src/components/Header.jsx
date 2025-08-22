import React from 'react';
import Button from './Button';

const Header = ({ 
  showNavigation = false,
  onLogout,
  className = "",
  children,
  userEmail,
  logoutLabel = "ログアウト",
  onMenuToggle,
  isMenuOpen
}) => {
  const baseClasses = "w-full h-16 md:h-[116px] bg-indigo-600 flex items-center";
  const navigationClasses = showNavigation ? "px-4 md:px-8" : "mb-8";
  const combinedClasses = `${baseClasses} ${navigationClasses} ${className}`.trim();

  return (
    <header className={combinedClasses}>
      {showNavigation ? (
        <div className="flex items-center justify-between w-full">
          <div className="text-white text-lg md:text-2xl font-bold">勤怠管理アプリ</div>
          <div className="flex flex-col items-center gap-1 md:gap-2">
            <div className="text-xs md:text-sm text-white">
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
                className="px-3 py-1 md:px-6 md:py-2 text-xs md:text-sm rounded-full"
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
              `( ${userEmail} )`
            ) : null}
          </div>
          {onLogout && (
            <Button
              onClick={onLogout}
              variant="secondary"
              className="px-3 py-1 md:px-6 md:py-2 text-xs md:text-sm rounded-full"
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