import React from "react";

function HelpSupport() {
  return (
    <div className="individual-page">

      <h2>
        Help & Support
      </h2>

      <p>
        Get help using SecureScan.
      </p>


      <div className="help-cards">

        <div className="simple-page-card">

          <div className="help-icon">
            📖
          </div>

          <h3>
            Documentation
          </h3>

          <p>
            Learn how to scan files and
            understand security reports.
          </p>

        </div>


        <div className="simple-page-card">

          <div className="help-icon">
            💬
          </div>

          <h3>
            Contact Support
          </h3>

          <p>
            Contact the SecureScan support team.
          </p>

        </div>

      </div>

    </div>
  );
}

export default HelpSupport;