import React, { useEffect, useMemo, useState } from "react";

const NOTIFICATIONS_KEY = "securescan_notifications";
const HISTORY_KEY = "securescan_scan_history";

const seedNotifications = () => {
  try {
    const existing = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || "[]");
    if (Array.isArray(existing) && existing.length) return existing;

    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    if (!Array.isArray(history)) return [];

    return history.slice(0, 20).map((item) => ({
      id: `scan-${item.id}`,
      type: item.result?.malicious > 0 ? "danger" : "success",
      title: item.result?.malicious > 0 ? "Threat detected" : "Scan completed",
      message: item.result?.malicious > 0
        ? `${item.fileName} contains ${item.result.malicious} malicious detection(s).`
        : `${item.fileName} was scanned successfully with no malicious detections.`,
      createdAt: item.scannedAt || new Date().toISOString(),
      read: false,
    }));
  } catch {
    return [];
  }
};

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");

  const loadNotifications = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || "null");
      const data = Array.isArray(saved) && saved.length ? saved : seedNotifications();
      setNotifications(data);
      if (!saved && data.length) localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(data));
    } catch {
      setNotifications([]);
    }
  };

  useEffect(() => {
    loadNotifications();
    const onStorage = (event) => {
      if (event.key === NOTIFICATIONS_KEY || event.key === HISTORY_KEY) loadNotifications();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = (next) => {
    setNotifications(next);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(next));
  };

  const unread = notifications.filter((item) => !item.read).length;
  const threats = notifications.filter((item) => item.type === "danger").length;
  const filtered = useMemo(() => {
    if (filter === "unread") return notifications.filter((item) => !item.read);
    if (filter === "threats") return notifications.filter((item) => item.type === "danger");
    return notifications;
  }, [filter, notifications]);

  const markAllRead = () => persist(notifications.map((item) => ({ ...item, read: true })));
  const clearAll = () => {
    if (window.confirm("Clear all notifications?")) persist([]);
  };

  const markRead = (id) => persist(notifications.map((item) => item.id === id ? { ...item, read: true } : item));

  return (
    <div className="individual-page notifications-page">
      <div className="notifications-hero">
        <div>
          <div className="page-eyebrow">SECURITY CENTER</div>
          <h2>Notifications</h2>
          <p>Stay updated on your scans, detected threats, and account activity.</p>
        </div>
        <div className="notification-bell">🔔<span>{unread}</span></div>
      </div>

      <div className="notification-stats">
        <div className="notification-stat"><span>🔔</span><div><small>Total</small><strong>{notifications.length}</strong></div></div>
        <div className="notification-stat"><span>●</span><div><small>Unread</small><strong>{unread}</strong></div></div>
        <div className="notification-stat danger"><span>⚠</span><div><small>Threat Alerts</small><strong>{threats}</strong></div></div>
        <div className="notification-stat safe"><span>✓</span><div><small>Security Status</small><strong>{threats ? "Review" : "Protected"}</strong></div></div>
      </div>

      <div className="notification-toolbar">
        <div className="notification-filters">
          {[['all', 'All'], ['unread', 'Unread'], ['threats', 'Threats']].map(([value, label]) => (
            <button key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>{label}</button>
          ))}
        </div>
        <div className="notification-actions">
          {unread > 0 && <button onClick={markAllRead}>✓ Mark all read</button>}
          {notifications.length > 0 && <button className="clear" onClick={clearAll}>Clear all</button>}
        </div>
      </div>

      <div className="notifications-list">
        {filtered.length === 0 ? (
          <div className="notifications-empty"><div>🔔</div><h3>You're all caught up</h3><p>New security alerts and scan updates will appear here.</p></div>
        ) : filtered.map((item) => (
          <button className={`notification-card ${item.read ? "read" : "unread"} ${item.type}`} key={item.id} onClick={() => markRead(item.id)}>
            <div className="notification-icon">{item.type === "danger" ? "⚠" : "✓"}</div>
            <div className="notification-body"><div className="notification-title"><strong>{item.title}</strong>{!item.read && <span>NEW</span>}</div><p>{item.message}</p><small>{new Date(item.createdAt).toLocaleString()}</small></div>
            <div className="notification-arrow">›</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Notifications;
