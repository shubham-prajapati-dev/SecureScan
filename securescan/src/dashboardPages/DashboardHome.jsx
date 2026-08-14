import React from "react";

import UploadPanel from "../components/dashboard/UploadPanel";
import TipsPanel from "../components/dashboard/TipsPanel";
import ScanningPanel from "../components/dashboard/ScanningPanel";
import ScanSummary from "../components/dashboard/ScanSummary";
import ThreatLevel from "../components/dashboard/ThreatLevel";
import RecentScanResults from "../components/dashboard/RecentScanResults";
import ThreatDetails from "../components/dashboard/ThreatDetails";

function DashboardHome({
  selectedFile,
  onFileSelect,
}) {

  return (
    <div className="dashboard-body">

      <div className="dashboard-top-row">

        <UploadPanel
          onFileSelect={onFileSelect}
        />

        <TipsPanel />

      </div>


      {selectedFile && (
        <ScanningPanel
          selectedFile={selectedFile}
        />
      )}


      <div className="summary-threat-row">

        <ScanSummary />

        <ThreatLevel />

      </div>


      <div className="results-threat-row">

        <RecentScanResults />

        <ThreatDetails />

      </div>

    </div>
  );
}

export default DashboardHome;