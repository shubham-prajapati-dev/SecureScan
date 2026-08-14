import React, { useRef } from "react";

function LandingNavbar({
  onFileSelect,
  darkMode,
  toggleDarkMode,
}) {

  const fileInputRef = useRef(null);

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {

    const file = event.target.files?.[0];

    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <nav className="landing-navbar">

      <div className="landing-logo">

        <div className="logo-shield">
          🛡️
        </div>

        <div>
          <h2>SecureScan</h2>

          <span>
            Advanced File Security
          </span>
        </div>

      </div>


      <div className="landing-links">

        <a href="#features">
          Features
        </a>

        <a href="#security">
          Security
        </a>

        <a href="#about">
          About
        </a>


        {/* NIGHT MODE */}

        <button
          className="theme-toggle"
          onClick={toggleDarkMode}
          aria-label="Toggle night mode"
          title={
            darkMode
              ? "Switch to Light Mode"
              : "Switch to Night Mode"
          }
        >
          {darkMode ? "☀️" : "🌙"}
        </button>


        <button
          className="landing-start"
          onClick={handleChooseFile}
        >
          Get Started
        </button>

      </div>


      <input
        ref={fileInputRef}
        type="file"
        hidden
        onChange={handleFileChange}
      />

    </nav>
  );
}

export default LandingNavbar;