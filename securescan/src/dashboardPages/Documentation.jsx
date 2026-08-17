import React from "react";
import "./Documentation.css";

function Documentation({ onBack }) {
  return (
    <div className="documentation-page">
      <div className="documentation-hero">
        <button className="doc-back" onClick={onBack}>← Back to Help & Support</button>
        <span className="doc-eyebrow">SECURESCAN DOCUMENTATION</span>
        <h2>Terms & Conditions</h2>
        <p>Please read these terms carefully before using SecureScan.</p>
        <div className="doc-updated">Last updated: August 17, 2026</div>
      </div>

      <div className="doc-content">
        <aside className="doc-nav">
          <a href="#acceptance">Acceptance</a>
          <a href="#service">Our Service</a>
          <a href="#uploads">File Scanning</a>
          <a href="#responsibilities">Your Responsibilities</a>
          <a href="#reports">Reports & Data</a>
          <a href="#availability">Availability</a>
          <a href="#changes">Changes</a>
          <a href="#contact">Contact</a>
        </aside>

        <article className="doc-article">
          <section id="acceptance"><h3>1. Acceptance of Terms</h3><p>By accessing or using SecureScan, you agree to these Terms & Conditions. If you do not agree with them, please do not use the service.</p></section>
          <section id="service"><h3>2. Our Service</h3><p>SecureScan provides file-scanning and security-analysis features designed to help users identify potentially malicious files. Detection results are provided for security assistance and should not be treated as an absolute guarantee that a file is safe.</p></section>
          <section id="uploads"><h3>3. File Scanning</h3><p>You are responsible for having the right to upload and scan files. Do not upload files containing information you are not authorized to process. Third-party scanning services may be used to analyze submitted files.</p></section>
          <section id="responsibilities"><h3>4. Your Responsibilities</h3><p>You agree not to misuse SecureScan, attempt to bypass security controls, interfere with the service, or use it for unlawful activity. You are responsible for maintaining appropriate backups of your own files.</p></section>
          <section id="reports"><h3>5. Reports & Data</h3><p>Scan history, reports, notifications and quarantine records may be stored locally in your browser depending on the feature. Clearing browser storage can remove locally stored records. Downloaded reports should be handled securely.</p></section>
          <section id="availability"><h3>6. Availability & Results</h3><p>We aim to keep SecureScan available and accurate, but scanning services can be temporarily unavailable and security engines can produce false positives or false negatives. Do not rely on a scan result as the sole security control for critical systems.</p></section>
          <section id="changes"><h3>7. Changes to These Terms</h3><p>We may update these terms as SecureScan evolves. The latest version will be made available on this page, with the revision date shown above.</p></section>
          <section id="contact"><h3>8. Contact</h3><p>If you need help or have questions about these terms, use the <strong>Contact Support</strong> page from Help & Support.</p></section>
        </article>
      </div>
    </div>
  );
}

export default Documentation;
