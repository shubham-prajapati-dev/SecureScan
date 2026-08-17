import React, { useState } from "react";

import Sidebar from "../components/dashboard/Sidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardHome from "../dashboardPages/DashboardHome";
import ScanFiles from "../dashboardPages/ScanFiles";
import ScanHistory from "../dashboardPages/ScanHistory";
import Notifications from "../dashboardPages/Notifications";
import Quarantine from "../dashboardPages/Quarantine";
import Reports from "../dashboardPages/Reports";
import Settings from "../dashboardPages/Settings";
import HelpSupport from "../dashboardPages/HelpSupport";
import Documentation from "../dashboardPages/Documentation";
import ContactSupport from "../dashboardPages/ContactSupport";
import Pricing from "../dashboardPages/Pricing";
import Login from "../dashboardPages/Login";

function DashboardPage({ selectedFile, onFileSelect, onHome }) {
  const [activePage, setActivePage] = useState("Dashboard");
  const showHeader = !["Pricing", "Login", "Documentation", "Contact Support"].includes(activePage);
  const openHelp = () => setActivePage("Help & Support");

  return (
    <div className="dashboard-app">
      {activePage !== "Login" && <Sidebar activePage={activePage} setActivePage={setActivePage} onHome={onHome} />}
      <main className={activePage === "Login" ? "dashboard-main login-main" : "dashboard-main"}>
        {showHeader && <DashboardHeader activePage={activePage} onLogin={() => setActivePage("Login")} />}
        {activePage === "Dashboard" && <DashboardHome selectedFile={selectedFile} onFileSelect={onFileSelect} />}
        {activePage === "Scan Files" && <ScanFiles selectedFile={selectedFile} onFileSelect={onFileSelect} />}
        {activePage === "Scan History" && <ScanHistory />}
        {activePage === "Notifications" && <Notifications />}
        {activePage === "Quarantine" && <Quarantine />}
        {activePage === "Reports" && <Reports />}
        {activePage === "Settings" && <Settings />}
        {activePage === "Help & Support" && <HelpSupport onDocumentation={() => setActivePage("Documentation")} onContactSupport={() => setActivePage("Contact Support")} />}
        {activePage === "Documentation" && <Documentation onBack={openHelp} />}
        {activePage === "Contact Support" && <ContactSupport onBack={openHelp} />}
        {activePage === "Pricing" && <Pricing onBack={() => setActivePage("Dashboard")} />}
        {activePage === "Login" && <Login onBack={() => setActivePage("Dashboard")} />}
      </main>
    </div>
  );
}

export default DashboardPage;
