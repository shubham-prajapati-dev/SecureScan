import React from "react";

function SecurityPreview() {

  return (
    <div className="hero-security-card">

      <div className="hero-glow"></div>

      <div className="security-preview">

        <div className="preview-header">

          <span>
            <i></i>
            Live Protection
          </span>

          <strong>
            ● Online
          </strong>

        </div>


        <div className="preview-shield">
          🛡️
        </div>


        <h3>
          Your files are protected
        </h3>


        <p>
          SecureScan actively monitors
          your files for potential threats.
        </p>


        <div className="preview-stats">

          <div>
            <strong>12,847</strong>
            <span>Files Scanned</span>
          </div>

          <div>
            <strong>99.8%</strong>
            <span>Detection Rate</span>
          </div>

        </div>


        <div className="safe-preview">
          ✓ No active threats detected
        </div>

      </div>

    </div>
  );
}

export default SecurityPreview;