import React, { useState, useEffect } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase.js";
import Header from "../components/Header.jsx";
import { useNavigate } from "react-router-dom";
import FormInput from "../components/FormInput.jsx";

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    auth.languageCode = 'ja';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("パスワード再発行メールを送信しました。メールをご確認ください。");
    } catch (err) {
      console.error('パスワードリセットエラー:', err);
      setError("メール送信に失敗しました。メールアドレスをご確認ください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100" style={{ height: '100dvh' }}>
      <Header showNavigation={true} onLogout={() => navigate('/admin-login')} userEmail={""} className="fixed top-0 left-0 w-full z-10" logoutLabel="管理者ログイン" />
      <div className="flex items-center justify-center pt-[78px] md:pt-[116px] px-4" style={{ height: '100dvh' }}>
        <form onSubmit={handleSubmit} className="bg-white p-10 rounded shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-indigo-600 mb-6 text-center">パスワード再発行</h2>
          {message && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-sm w-full text-center">{message}</div>}
          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm w-full text-center">{error}</div>}
          <FormInput
            type="email"
            label="メールアドレス"
            id="email"
            name="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required={true}
          />
          <button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 rounded text-lg transition"
            disabled={loading}
          >
            パスワードを再発行する
          </button>
                      <div className="mt-6 w-full text-center">
              <a
                href="/login"
                onClick={e => { e.preventDefault(); navigate('/login'); }}
                className="text-indigo-600 hover:underline font-bold text-sm"
              >
               ユーザーログインに戻る
              </a>
            </div>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword; 