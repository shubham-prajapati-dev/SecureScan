import React, { useEffect, useMemo, useState } from "react";
import "./NotificationDropdown.css";
import "./DashboardTheme.css";

const NOTIFICATIONS_KEY = "securescan_notifications";
const HISTORY_KEY = "securescan_scan_history";
const THEME_KEY = "securescan_theme";

function getHistoryNotifications() {
  try {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    if (!Array.isArray(history)) return [];
    return history.slice(0, 20).filter((item) => item.result && (item.status === "Completed" || item.status === "Quarantined")).map((item) => ({
      id: `scan-${item.id}`,
      type: item.result?.malicious > 0 ? "danger" : "success",
      title: item.result?.malicious > 0 ? "Threat Detected" : "Scan Completed",
      message: item.result?.malicious > 0 ? `${item.fileName} contains ${item.result.malicious} malicious detection(s).` : `${item.fileName} was scanned successfully with no malicious detections.`,
      createdAt: item.scannedAt || new Date().toISOString(),
      read: false,
    }));
  } catch { return []; }
}

function getNotifications() {
  try {
    const saved = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || "[]");
    const savedList = Array.isArray(saved) ? saved : [];
    const historyList = getHistoryNotifications();
    const byId = new Map();
    [...savedList, ...historyList].forEach((item) => {
      const existing = byId.get(item.id);
      byId.set(item.id, existing ? { ...item, read: existing.read } : item);
    });
    return [...byId.values()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 50);
  } catch { return []; }
}

function formatTime(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function DashboardHeader({ activePage, onLogin }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem(THEME_KEY) === "dark");
  const loadNotifications = () => setNotifications(getNotifications());

  useEffect(() => {
    loadNotifications();
    const refresh = () => loadNotifications();
    window.addEventListener("storage", refresh);
    window.addEventListener("securescan-notifications-updated", refresh);
    window.addEventListener("securescan-history-updated", refresh);
    const interval = window.setInterval(refresh, 2000);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("securescan-notifications-updated", refresh);
      window.removeEventListener("securescan-history-updated", refresh);
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("securescan-dark", darkMode);
    localStorage.setItem(THEME_KEY, darkMode ? "dark" : "light");
  }, [darkMode]);

  const unread = notifications.filter((item) => !item.read).length;
  const visibleNotifications = useMemo(() => notifications.slice(0, 3), [notifications]);
  const markAllRead = () => { const next = notifications.map((item) => ({ ...item, read: true })); localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(next)); setNotifications(next); window.dispatchEvent(new Event("securescan-notifications-updated")); };
  const markRead = (id) => { const next = notifications.map((item) => item.id === id ? { ...item, read: true } : item); localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(next)); setNotifications(next); window.dispatchEvent(new Event("securescan-notifications-updated")); };

  return (
    <header className="dashboard-header">
      <div className="dashboard-header-info"><h1>{activePage}</h1><p>Stay safe by scanning your files for malicious threats.</p></div>
      <div className="header-actions">
        <div className="notification-wrapper">
          <button className={`notification-button ${showNotifications ? "notification-active" : ""}`} onClick={() => setShowNotifications((value) => !value)} aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}>
            <svg className="bell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>{unread > 0 && <span className="notification-badge">{unread > 99 ? "99+" : unread}</span>}{unread > 0 && <span className="notification-pulse"></span>}
          </button>
          {showNotifications && <div className="notification-dropdown">
            <div className="notification-dropdown-header"><div><h3>Notifications</h3><span>{unread} unread notification{unread === 1 ? "" : "s"}</span></div>{unread > 0 && <button type="button" onClick={markAllRead}>Mark all read</button>}</div>
            <div className="notification-list">{visibleNotifications.length === 0 ? <div className="notification-empty">You're all caught up.</div> : visibleNotifications.map((notification) => <button className={`notification-item ${notification.read ? "read" : "unread"}`} key={notification.id} type="button" onClick={() => markRead(notification.id)}><div className={`notification-item-icon ${notification.type}`}>{notification.type === "danger" ? "⚠️" : "🛡️"}</div><div className="notification-item-content"><strong>{notification.title}</strong><p>{notification.message}</p><span>{formatTime(notification.createdAt)}</span></div>{!notification.read && <span className="unread-dot"></span>}</button>)}</div>
            <button className="view-all-notifications" type="button" onClick={() => setShowNotifications(false)}>View all →</button>
          </div>}
        </div>
        <button className="header-theme-button" aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"} type="button" onClick={() => setDarkMode((value) => !value)}>{darkMode ? "☀" : "◐"}</button>
        <button className="header-profile-button" aria-label="Open login page" type="button" onClick={onLogin}><span className="header-profile-avatar">A</span></button>
      </div>
    </header>
  );
}

export default DashboardHeader;
