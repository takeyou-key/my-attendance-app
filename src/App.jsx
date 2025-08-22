import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import AdminLogin from "./pages/AdminLogin";
import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";
import History from "./pages/History";
import Clock from "./pages/Clock";
import RequestList from "./pages/RequestList";
import AdminHome from "./pages/AdminHome";
import Settings from "./pages/Settings";
// import { useSessionTimeout } from './hooks/useSessionTimeout';

function App() {
  // セッションタイムアウト機能を有効化（30分）
  // useSessionTimeout(30, true);

  return (
    <BrowserRouter>
      <Routes>
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
