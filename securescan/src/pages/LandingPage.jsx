import React, { useState } from "react";

import LandingNavbar from "../components/landing/LandingNavbar";
import HeroSection from "../components/landing/HeroSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import SecuritySection from "../components/landing/SecuritySection";
import AboutSection from "../components/landing/AboutSection";
import LandingFooter from "../components/landing/LandingFooter";

function LandingPage({ onFileSelect }) {

  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode((previous) => !previous);
  };

  return (
    <div
      className={
        darkMode
          ? "landing-page dark-mode"
          : "landing-page"
      }
    >

      <LandingNavbar
        onFileSelect={onFileSelect}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      <HeroSection
        onFileSelect={onFileSelect}
      />

      <FeaturesSection />

      <SecuritySection />

      <AboutSection />

      <LandingFooter />

    </div>
  );
}

export default LandingPage;