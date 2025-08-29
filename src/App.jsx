import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import Layout from "./components/Layout.jsx";
import AdminLayout from "./components/AdminLayout.jsx";
import History from "./pages/History.jsx";
import Clock from "./pages/Clock.jsx";
import RequestList from "./pages/RequestList.jsx";
import AdminHome from "./pages/AdminHome.jsx";
import Settings from "./pages/Settings.jsx";
import { useSessionTimeout } from './hooks/useSessionTimeout';

function App() {
  // セッションタイムアウト機能を有効化（30分）
  useSessionTimeout(30, true);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/home" element={<Layout />}>
          <Route index element={<Clock />} />
          <Route path="history" element={<History />} />
          <Route path="requestlist" element={<RequestList />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminHome />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
