import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  type = "button", 
  variant = "primary", 
  disabled = false, 
  className = "",
  fullWidth = false,
  bgColor,
  textColor
}) => {
  const baseClasses = "font-bold rounded transition-all duration-200 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-indigo-400 hover:scale-105 active:scale-95 active:transition-none";
  
  const variantClasses = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl",
    secondary: "bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg hover:shadow-xl border border-indigo-200",
    text: "text-indigo-600 hover:underline bg-transparent hover:bg-indigo-50",
    none: ""
  };
  
  const sizeClasses = fullWidth ? "w-full" : "";
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";
  
  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses} ${disabledClasses} ${className}`.trim();
  
  const buttonStyle = {};
  if (bgColor) {
    buttonStyle.backgroundColor = bgColor;
    buttonStyle.opacity = 0.6;
  }
  if (textColor) {
    buttonStyle.color = textColor;
  }
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClasses}
      style={buttonStyle}
    >
      {children}
    </button>
  );
};

export default Button; 