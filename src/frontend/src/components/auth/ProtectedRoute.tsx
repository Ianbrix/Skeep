import { useAuthStore } from "@/store/authStore";
import { Navigate, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";

export function ProtectedRoute() {
  const { isAuthenticated, checkInactivity, updateActivity } = useAuthStore();

  useEffect(() => {
    const handleActivity = () => updateActivity();
    const events = ["mousemove", "keydown", "click", "touchstart"];
    for (const e of events) window.addEventListener(e, handleActivity);

    const inactivityInterval = setInterval(() => {
      checkInactivity();
    }, 60_000);

    return () => {
      for (const e of events) window.removeEventListener(e, handleActivity);
      clearInterval(inactivityInterval);
    };
  }, [checkInactivity, updateActivity]);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
}
