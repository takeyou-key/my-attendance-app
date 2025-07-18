import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import Button from '../components/Button';
import Header from '../components/Header';

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("ログイン成功", userCredential.user);
            navigate('/home');
        } catch (error) {
            console.error("ログイン失敗", error);
            setError("メールアドレスまたはパスワードが正しくありません。");
        }
    };

    const handleRegisterClick = () => {
        navigate('/register');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
            <div className="flex flex-1 min-h-[calc(100vh-104px)] items-center justify-center">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white p-8 rounded shadow-md w-full max-w-sm"
                >
                    <h2 className="text-2xl font-bold mb-6 text-center text-indigo-600">ログイン</h2>
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
                    <div className="mb-6">
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
                    <div className="mb-4 text-center">
                        <a
                            href="#"
                            className="text-red-600 hover:underline font-bold text-sm "
                        >
                            パスワードを忘れた方はこちら
                        </a>
                    </div>
                    <Button
                        type="submit"
                        fullWidth={true}
                        className="py-2 mb-3"
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