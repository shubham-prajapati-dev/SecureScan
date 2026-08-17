import React from "react";
import "./HelpSupport.css";

function HelpSupport({ onDocumentation, onContactSupport }) {
  return (
    <div className="individual-page">
      <h2>Help & Support</h2>
      <p>Get help using SecureScan.</p>
      <div className="help-cards">
        <button className="simple-page-card help-card-button" type="button" onClick={onDocumentation}>
          <div className="help-icon">📖</div>
          <h3>Documentation</h3>
          <p>Read SecureScan Terms & Conditions and learn how the service works.</p>
          <span className="help-card-link">Open Documentation →</span>
        </button>
        <button className="simple-page-card help-card-button" type="button" onClick={onContactSupport}>
          <div className="help-icon">💬</div>
          <h3>Contact Support</h3>
          <p>Send a support request to report a problem, ask a question, or share feedback.</p>
          <span className="help-card-link">Contact Support →</span>
        </button>
      </div>
    </div>
  );
}

export default HelpSupport;