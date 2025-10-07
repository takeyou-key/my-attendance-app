import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase.js';
import { isAdmin } from '../utils/auth.js';
import Button from '../components/Button.jsx';
import Header from '../components/Header.jsx';
import FormInput from '../components/FormInput.jsx';

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        console.log("=== ログインフォーム送信開始 ===");
        console.log("入力email:", email);
        console.log("入力password:", password ? "***" : "空");
        console.log("送信時刻:", new Date().toLocaleString());
        
        setError("");
        
        try {
            console.log("1. 既存の認証をクリア中...");
            await signOut(auth);
            console.log("既存認証クリア完了");
            
            console.log("2. Firebase認証開始...");
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("ログイン成功");
            console.log("ユーザー情報:", {
                uid: userCredential.user.uid,
                email: userCredential.user.email,
                emailVerified: userCredential.user.emailVerified
            });
            
            console.log("3. 管理者権限チェック中...");
            const adminCheck = await isAdmin(userCredential.user.uid);
            console.log("管理者権限:", adminCheck ? "あり" : "なし");
            
            if (adminCheck) {
                console.log("4a. 管理者として処理中...");
                localStorage.setItem('adminEmail', userCredential.user.email);
                sessionStorage.setItem('loginTime', Date.now().toString());
                console.log("管理者情報をlocalStorageに保存:", userCredential.user.email);
                navigate('/admin');
                console.log("管理者画面に遷移");
            } else {
                console.log("4b. 一般ユーザーとして処理中...");
                localStorage.setItem('userEmail', userCredential.user.email);
                sessionStorage.setItem('loginTime', Date.now().toString());
                console.log("ユーザー情報をlocalStorageに保存:", userCredential.user.email);
                navigate('/home');
                console.log("一般ユーザー画面に遷移");
            }
        } catch (error) {
            console.group("ログインエラー");
            console.error("エラーオブジェクト:", error);
            console.log("エラーコード:", error.code);
            console.log("エラーメッセージ:", error.message);
            console.log("入力email:", email);
            console.groupEnd();
            setError("メールアドレスまたはパスワードが正しくありません。");
        }
        
        console.log("=== ログイン処理完了 ===");
    };

    const handleRegisterClick = () => {
        navigate('/register');
        console.log("新規登録画面に遷移");
    };

    return (
        <div className="bg-gray-100" style={{ height: '100dvh' }}>
            <Header showNavigation={true} onLogout={() => navigate('/admin-login')} userEmail={""} className="fixed top-0 left-0 w-full z-10" logoutLabel="管理者ログイン" />
            <div className="flex items-center justify-center pt-[78px] md:pt-[116px] px-4 py-8" style={{ height: '100dvh' }}>
                <form
                    onSubmit={handleSubmit}
                    className="bg-white p-4 md:p-6 lg:p-8 rounded shadow-md w-full max-w-sm"
                >
                    <h2 className="text-lg md:text-xl lg:text-2xl font-bold mb-3 md:mb-4 lg:mb-6 text-center text-indigo-600">ログイン</h2>
                    {error && (
                        <div className="mb-3 p-2 md:p-3 bg-red-100 text-red-700 rounded text-xs md:text-sm">
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
                    <div className="mb-2 md:mb-3 lg:mb-4 text-center">
                        <a
                            href="/reset-password"
                            onClick={(e) => { e.preventDefault(); navigate('/reset-password'); }}
                            className="text-red-600 hover:underline font-bold text-xs md:text-sm cursor-pointer"
                        >
                            パスワードを忘れた方はこちら
                        </a>
                    </div>
                    <Button
                        type="submit"
                        fullWidth={true}
                        className="py-2 mb-2"
                    >
                        ログイン
                    </Button>
                    <Button
                        type="button"
                        onClick={handleRegisterClick}
                        variant="text"
                        fullWidth={true}
                        className="py-2"
                    >
                        新規登録はこちらから
                    </Button>
                </form>
            </div>
        </div>
    );
}

export default Login; 