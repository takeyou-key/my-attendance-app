import React from 'react';

/**
 * フォーム入力コンポーネント
 * アプリケーション全体で使用される統一されたフォーム入力
 *
 * @param {Object} props - コンポーネントのプロパティ
 * @param {string} props.type - 入力タイプ（"text", "email", "password", "select"）（デフォルト: "text"）
 * @param {string} props.label - ラベルテキスト
 * @param {string} props.id - 入力要素のID
 * @param {string} props.name - 入力要素のname属性
 * @param {string} props.value - 入力値
 * @param {function} props.onChange - 値変更時のコールバック関数
 * @param {string} props.placeholder - プレースホルダーテキスト
 * @param {boolean} props.required - 必須入力かどうか（デフォルト: false）
 * @param {boolean} props.disabled - 無効状態かどうか（デフォルト: false）
 * @param {string} props.error - エラーメッセージ
 * @param {Array} props.options - セレクトボックスのオプション（{value: string, label: string}）
 * @param {string} props.className - 追加のCSSクラス
 * @param {Object} props.inputProps - 追加のinput属性
 */
const FormInput = ({
  type = "text",
  label,
  id,
  name,
  value,
  onChange,
  placeholder = "",
  required = false,
  disabled = false,
  error = "",
  options = [],
  className = "",
  inputProps = {}
}) => {
  const baseClasses = "w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors";
  const errorClasses = error ? "border-red-500 focus:ring-red-400" : "border-gray-300";
  const disabledClasses = disabled ? "bg-gray-100 cursor-not-allowed" : "";
  const combinedClasses = `${baseClasses} ${errorClasses} ${disabledClasses} ${className}`.trim();

  const renderInput = () => {
    if (type === "select") {
      return (
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={combinedClasses}
          {...inputProps}
        >
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={combinedClasses}
        {...inputProps}
      />
    );
  };

  return (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={id}
          className="block text-gray-700 mb-2 font-medium"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {renderInput()}
      {error && (
        <div className="mt-1 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

export default FormInput; 