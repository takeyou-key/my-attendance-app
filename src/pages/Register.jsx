import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase.js';
import Button from '../components/Button.jsx';
import Header from '../components/Header.jsx';
import FormInput from '../components/FormInput.jsx';

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
            <Header showNavigation={true} onLogout={() => navigate('/login')} userEmail={""} className="fixed top-0 left-0 w-full z-10" logoutLabel="ログイン" />
            <div className="flex min-h-screen items-center justify-center pt-[78px] md:pt-[116px] pb-4">
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
                    <FormInput
                        type="email"
                        label="メールアドレス"
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required={true}
                    />
                    <FormInput
                        type="password"
                        label="パスワード"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required={true}
                    />
                    <FormInput
                        type="password"
                        label="パスワード（確認）"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required={true}
                    />
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