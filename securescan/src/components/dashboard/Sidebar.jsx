import React from "react";

function Sidebar({ activePage, setActivePage, onHome }) {
  const menuItems = [
    ["⌂", "Dashboard"],
    ["▣", "Scan Files"],
    ["◷", "Scan History"],
    ["🔔", "Notifications"],
    ["▤", "Quarantine"],
    ["▤", "Reports"],
    ["⚙", "Settings"],
    ["?", "Help & Support"],
  ];

  const openPricing = () => setActivePage("Pricing");

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-shield">🛡️</div>
        <div><h2>SecureScan</h2><span>File Scanner</span></div>
      </div>

      <div className="sidebar-menu">
        {menuItems.map(([icon, name]) => (
          <button key={name} className={activePage === name ? "sidebar-menu-item active" : "sidebar-menu-item"} onClick={() => setActivePage(name)}>
            <span className="menu-icon">{icon}</span>{name}
            {name === "Notifications" && <span className="notification-menu-dot" />}
          </button>
        ))}
      </div>

      <div className="realtime-box">
        <div className="realtime-icon">🛡️</div>
        <div><strong>Real-time Protection</strong><span>Enabled</span></div>
      </div>

      <button className="sidebar-home" onClick={onHome}>← Back to Home</button>

      <button className={`sidebar-profile ${activePage === "Pricing" ? "pricing-active" : ""}`} onClick={openPricing} type="button" title="Open pricing plans">
        <div className="profile-avatar">A</div>
        <div><strong>Anumat</strong><span>{localStorage.getItem("securescan_plan") || "Premium Plan"}</span></div>
        <b>›</b>
      </button>
    </aside>
  );
}

export default Sidebar;
