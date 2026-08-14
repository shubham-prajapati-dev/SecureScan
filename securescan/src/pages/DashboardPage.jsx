import React, { useState } from "react";

import Sidebar from "../components/dashboard/Sidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";

import DashboardHome from "../dashboardPages/DashboardHome";
import ScanFiles from "../dashboardPages/ScanFiles";
import ScanHistory from "../dashboardPages/ScanHistory";
import Quarantine from "../dashboardPages/Quarantine";
import Reports from "../dashboardPages/Reports";
import Settings from "../dashboardPages/Settings";
import HelpSupport from "../dashboardPages/HelpSupport";

function DashboardPage({
  selectedFile,
  onFileSelect,
  onHome,
}) {
  const [activePage, setActivePage] =
    useState("Dashboard");

  return (
    <div className="dashboard-app">

      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        onHome={onHome}
      />

      <main className="dashboard-main">

        <DashboardHeader
          activePage={activePage}
        />

        {activePage === "Dashboard" && (
          <DashboardHome
            selectedFile={selectedFile}
            onFileSelect={onFileSelect}
          />
        )}

        {activePage === "Scan Files" && (
          <ScanFiles
            selectedFile={selectedFile}
            onFileSelect={onFileSelect}
          />
        )}

        {activePage === "Scan History" && (
          <ScanHistory />
        )}

        {activePage === "Quarantine" && (
          <Quarantine />
        )}

        {activePage === "Reports" && (
          <Reports />
        )}

        {activePage === "Settings" && (
          <Settings />
        )}

        {activePage === "Help & Support" && (
          <HelpSupport />
        )}

      </main>

    </div>
  );
}

export default DashboardPage;