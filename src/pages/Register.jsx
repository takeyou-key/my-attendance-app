import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import Button from '../components/Button';
import Header from '../components/Header';

function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        
        console.log("会員登録開始", { email, password, confirmPassword });
        
        if (password !== confirmPassword) {
            setError("パスワードが一致しません。");
            return;
        }
        
        try {
            console.log("Firebase認証開始");
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log("登録成功", userCredential.user);
            navigate('/home');
        } catch (error) {
            console.error("登録失敗", error);
            console.error("エラーコード:", error.code);
            console.error("エラーメッセージ:", error.message);
            
            if (error.code === 'auth/email-already-in-use') {
                setError("このメールアドレスは既に使用されています。");
            } else if (error.code === 'auth/weak-password') {
                setError("パスワードは6文字以上で入力してください。");
            } else if (error.code === 'auth/invalid-email') {
                setError("メールアドレスの形式が正しくありません。");
            } else {
                setError(`登録に失敗しました: ${error.message}`);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
            <div className="flex flex-1 min-h-[calc(100vh-104px)] items-center justify-center">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white p-8 rounded shadow-md w-full max-w-sm"
                >
                    <h2 className="text-2xl font-bold mb-6 text-center text-indigo-600">新規登録</h2>
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
                            {error}
                        </div>
                    )}
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="email">
                            メールアドレス
                        </label>
                        <input
                            id="email"
                            type="email"
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="password">
                            パスワード
                        </label>
                        <input
                            id="password"
                            type="password"
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2" htmlFor="confirmPassword">
                            パスワード（確認）
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <Button
                        type="submit"
                        fullWidth={true}
                        className="py-2 mb-3"
                    >
                        新規登録
                    </Button>
                    <Button
                        type="button"
                        onClick={() => navigate('/login')}
                        variant="text"
                        fullWidth={true}
                        className="py-2"
                    >
                        ログインはこちらから
                    </Button>
                </form>
            </div>
        </div>
    );
}

export default Register; 