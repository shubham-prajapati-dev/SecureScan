import React from "react";

function TipsPanel() {

  return (
    <div className="tips-panel">

      <h2>
        Tips for Safe Scanning
      </h2>

      <div className="tip">
        <span>♧</span>
        Scan files before opening
      </div>

      <div className="tip">
        <span>⚙</span>
        Keep your software updated
      </div>

      <div className="tip">
        <span>⚠</span>
        Avoid unknown or suspicious files
      </div>

      <div className="tip">
        <span>♢</span>
        Enable real-time protection
      </div>

      <div className="tip-shield">
        🛡️
      </div>

    </div>
  );
}

export default TipsPanel;