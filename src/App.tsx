import { useEffect, useState } from "react";
import AuthPanel from "./components/AuthPanel";
import CustomerPortal from "./components/CustomerPortal";
import StaffPortal from "./components/StaffPortal";
import { ToastMessage } from "./components/Shared";
import { clearSession, loadData, loadSession, saveData, saveSession } from "./lib/portalDb";
import { PortalData, Toast, User } from "./types";

export default function App() {
  const [data, setData] = useState<PortalData>(() => loadData());
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => loadSession());
  const [toast, setToast] = useState<Toast | null>(null);

  const user = data.users.find((item) => item.id === currentUserId) ?? null;

  useEffect(() => {
    saveData(data);
  }, [data]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const login = (nextUser: User) => {
    setCurrentUserId(nextUser.id);
    saveSession(nextUser.id);
    setToast({ type: "success", message: `Signed in as ${nextUser.name}.` });
  };

  const logout = () => {
    setCurrentUserId(null);
    clearSession();
  };

  return (
    <>
      {!user ? (
        <AuthPanel data={data} onDataChange={setData} onLogin={login} />
      ) : user.role === "customer" ? (
        <CustomerPortal data={data} user={user} onDataChange={setData} onToast={setToast} onLogout={logout} />
      ) : (
        <StaffPortal data={data} user={user} onDataChange={setData} onToast={setToast} onLogout={logout} />
      )}
      {toast ? <ToastMessage type={toast.type} message={toast.message} /> : null}
    </>
  );
}
