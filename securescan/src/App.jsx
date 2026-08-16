import React, { useState } from "react";
import "./App.css";
import "./DashboardUI.css";

import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import UploadPanel from "../src/components/dashboard/UploadPanel";

function App() {
  const [currentPage, setCurrentPage] = useState("landing");
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (file) => {
    if (!file) return;
    setSelectedFile(file);
    setCurrentPage("dashboard");
  };

  const goHome = () => {
    setCurrentPage("landing");
  };

  return (
    <>
      {currentPage === "landing" && (
        <LandingPage onFileSelect={handleFileSelect} />
      )}

      {currentPage === "dashboard" && (
        <DashboardPage
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
          onHome={goHome}
        />
      )}
    </>
  );
}

export default App;
