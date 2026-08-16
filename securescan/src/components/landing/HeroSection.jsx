import React, { useRef } from "react";
import SecurityPreview from "./SecurityPreview";

function HeroSection({ onFileSelect, onGetStarted }) {
  const inputRef = useRef(null);

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <section className="landing-hero">
      <div className="hero-left">
        <div className="security-badge">
          🛡️ Advanced File Protection
        </div>

        <h1>
          Detect.
          <br />
          <span>Protect.</span>
          <br />
          Stay Secure.
        </h1>

        <p>
          SecureScan analyzes your files for malware, viruses, Trojans and
          other malicious threats before they can harm your system.
        </p>

        <button
          className="hero-start"
          type="button"
          onClick={onGetStarted}
        >
          Get Started →
        </button>

        <input
          ref={inputRef}
          type="file"
          hidden
          onChange={handleFileChange}
        />

        <div className="landing-trust">
          <span>✓ Secure scanning</span>
          <span>✓ Threat detection</span>
          <span>✓ Fast analysis</span>
        </div>
      </div>

      <SecurityPreview />
    </section>
  );
}

export default HeroSection;
