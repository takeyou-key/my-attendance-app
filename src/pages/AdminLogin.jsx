import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase.js';
import { isAdmin } from '../utils/auth.js';
import Button from '../components/Button.jsx';
import Header from '../components/Header.jsx';
import FormInput from '../components/FormInput.jsx';

/**
 * 管理者専用ログイン画面コンポーネント
 * 管理者認証後に管理者ホームに遷移
 */
function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            // 既存の認証をクリア
            await signOut(auth);
            
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("管理者ログイン成功", userCredential.user);
            
            // 管理者権限を確認
            const adminCheck = await isAdmin(userCredential.user.uid);
            if (adminCheck) {
                // 管理者情報をlocalStorageに保存
                localStorage.setItem('adminEmail', userCredential.user.email);
                // 管理者の場合は管理者ホームに遷移
                navigate('/admin');
            } else {
                // 管理者権限がない場合はエラー
                setError("管理者権限がありません。");
            }
        } catch (error) {
            console.error("管理者ログイン失敗", error);
            setError("メールアドレスまたはパスワードが正しくありません。");
        }
    };

    const handleBackToLogin = () => {
        navigate('/login');
    };

    return (
        <div className="bg-gray-100" style={{ height: '100dvh' }}>
            <Header showNavigation={true} onLogout={() => navigate('/admin-login')} userEmail={""} className="fixed top-0 left-0 w-full z-10" logoutLabel="管理者ログイン" />
            <div className="flex items-center justify-center pt-[78px] md:pt-[116px] px-4" style={{ height: '100dvh' }}>
                <form
                    onSubmit={handleSubmit}
                    className="bg-white p-8 rounded shadow-md w-full max-w-sm"
                >
                    <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#059669', opacity: 0.6 }}>管理者ログイン</h2>
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
                        // required={true}
                    />
                    <FormInput
                        type="password"
                        label="パスワード"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        // required={true}
                    />
                    <Button
                        type="submit"
                        fullWidth={true}
                        className="py-2 mb-3"
                        bgColor="#059669"
                        textColor="#FFFFFF"
                    >
                        管理者ログイン
                    </Button>
                    <Button
                        type="button"
                        onClick={handleBackToLogin}
                        variant="text"
                        fullWidth={true}
                        className="py-2"
                        textColor="#059669"
                    >
                        ユーザーログインに戻る
                    </Button>
                </form>
            </div>
        </div>
    );
}

export default AdminLogin; 